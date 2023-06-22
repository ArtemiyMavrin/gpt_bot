import { code } from 'telegraf/format'
import { ogg } from '../class/ogg.js'
import { openai } from '../class/openai.js'
import { speechKit } from '../class/sppechkit.js'
import { processing } from '../errors.js'
import config from 'config'
import { checkSubscribe } from '../db.js'
import { replaySubscribe } from '../utils.js'

const supportMessage = config.get('SUPPORT_MESSAGE')

const getVoiceFileLink = async (ctx) => {
    const { file_id } = ctx.message.voice
    const link = await ctx.telegram.getFileLink(file_id)
    return link.href
}

const sendResponse = async (ctx, response) => {
    if (ctx.session.replayType === 'voice') {
        const voice = ctx.session.voice ??= 'ermil'
        const voiceMessage = await speechKit.textToVoice(response.content, voice)
        await ctx.replyWithVoice({ source: voiceMessage }, {
            reply_to_message_id: ctx.message.message_id
        })
    } else {
        await ctx.reply(response.content, {
            reply_to_message_id: ctx.message.message_id
        })
    }
}

export const handleVoiceMessage = async (ctx) => {
    ctx.session.messages ??= []
    const checkPay = await checkSubscribe(ctx.from.id, ctx.from.first_name)
    if(!checkPay) { return replaySubscribe(ctx) }
    try {
        const { message_id } = await ctx.reply(code('Обработка голоса...'), {
            reply_to_message_id: ctx.message.message_id
        })
        const link = await getVoiceFileLink(ctx)
        const userId = String(ctx.message.from.id)
        const oggPath = await ogg.create(link, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)
        const text = await openai.transcription(mp3Path)

        await ctx.telegram.editMessageText(ctx.chat.id, message_id, 0,
            code(`Ваш запрос: ${text}\n\nГотовлю ответ...`), {
                reply_to_message_id: ctx.message.message_id
            })

        ctx.session.messages.push({ role: openai.roles.USER, content: text })

        const response = await openai.chat(ctx.session.messages)

        ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: response.content })

        await sendResponse(ctx, response)

        await ctx.deleteMessage(message_id)
    } catch (e) {
        console.log('Ошибка обработки голосового сообщения')
        const messageError = processing(e)
        await ctx.reply(code(messageError))
        await ctx.reply(supportMessage)
    }
}

export const handleTextMessage = async (ctx) => {
    ctx.session.messages ??= []
    const checkPay = await checkSubscribe(ctx.from.id, ctx.from.first_name)
    const randomNumber = Math.round(Math.random() * (15 - 5) + 5)*1000
    if (!checkPay) {
        const { message_id } = await ctx.reply(`⏳ Одижание в очереди. Ваш номер ${randomNumber/1000}`)
        await new Promise(resolve => setTimeout(resolve, randomNumber))
        await ctx.deleteMessage(message_id)
    }
    try {
        const { message_id } = await ctx.reply(code('Уже готовлю ответ...'), {
            reply_to_message_id: ctx.message.message_id
        })

        ctx.session.messages.push({ role: openai.roles.USER, content: ctx.message.text })

        const response = await openai.chat(ctx.session.messages)

        ctx.session.messages.push({ role: openai.roles.ASSISTANT, content: response.content })

        await sendResponse(ctx, response)

        await ctx.deleteMessage(message_id)
    } catch (e) {
        console.log('Ошибка обработки текстового сообщения', e.message)
        const messageError = processing(e)
        await ctx.reply(code(messageError))
        await ctx.reply(supportMessage)
    }
}