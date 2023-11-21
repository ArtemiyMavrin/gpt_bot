import { Markup } from 'telegraf'
import { checkSubscribe } from '../db.js'
import { replaySubscribe } from '../utils.js'

const voiceMessage = `А теперь выбери голос озвучки
Его всегда можно изменить в настройках бота!
Не стесняйся — экспериментируй!`

const textMessage = 'Теперь напиши свой вопрос боту или запиши голосовое сообщение'

const VoiceKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback('👨🏼‍ Эмиль (по умолчанию)', 'ermil')
    ],[
        Markup.button.callback('👩🏼 Алёна', 'alena'),
        Markup.button.callback('👨🏼 Филипп', 'filipp')
    ],[
        Markup.button.callback('👩🏼 Джейн', 'jane'),
        Markup.button.callback('👨🏼 Мадирос', 'madirus')
    ]])

export const handleReplayTypeSelection = (replayType,textReplayType) => async (ctx) => {
    ctx.session.messages ??= []
    const checkPay = await checkSubscribe(ctx.from.id, ctx.from.first_name)
    if(!checkPay) { return replaySubscribe(ctx) }
    ctx.session.replayType = replayType
    await ctx.deleteMessage()
    await ctx.answerCbQuery(`Отлично! Твой выбор — ${textReplayType}!`)
    await ctx.reply(
        `Отлично! Твой выбор — ${textReplayType}!`)
    if (replayType === 'voice') {
        await ctx.reply(voiceMessage,VoiceKeyboard)
    }else if (replayType === 'text') {
        await ctx.reply(textMessage)
    } else {
        await ctx.reply('Выбран неверный тип')
    }
}

export const handleSelectedVoice = (voice,voiceName) => async (ctx) => {
    ctx.session.messages ??= []
    const checkPay = await checkSubscribe(ctx.from.id, ctx.from.first_name)
    if(!checkPay) { return replaySubscribe(ctx) }
    ctx.session.voice = voice
    await ctx.deleteMessage()
    await ctx.answerCbQuery(`Отлично! Твой выбор — ${voiceName}!`)
    await ctx.reply(`Отлично! Твой выбор — ${voiceName}!\n` +
        'Теперь напиши свой вопрос боту или запиши голосовое сообщение')
}