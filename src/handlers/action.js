import { Markup } from 'telegraf'
import config from "config"
import { checkSubscribe } from '../db.js'
import { replaySubscribe } from '../utils.js'

const adminMessage = config.get('ADMIN_CONTACT_MESSAGE')
const price = config.get('ONE_PRICE')

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
    ctx.session ??= { messages: [] }
    const checkPay = await checkSubscribe(ctx.from.id)
    if(!checkPay) { return replaySubscribe(ctx) }
    ctx.session.replayType = replayType
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
    ctx.session ??= { messages: [] }
    const checkPay = await checkSubscribe(ctx.from.id)
    if(!checkPay) { return replaySubscribe(ctx) }
    ctx.session.voice = voice
    await ctx.answerCbQuery(`Отлично! Твой выбор — ${voiceName}!`)
    await ctx.reply(`Отлично! Твой выбор — ${voiceName}!\n` +
        'Теперь напиши свой вопрос боту или запиши голосовое сообщение')
}

// export const handlePlan = () => async (ctx) => {
//     ctx.reply(`Выбери тариф:
// Доступ на 30 дней — ${price[0]}₽
// Доступ на 90 дней — ${price[1]}₽ (${Math.round(price[1]/3)}₽ в месяц)
// Доступ на 180 дней — ${price[2]}₽ (${Math.round(price[2]/6)}₽ в месяц)
// Доступ на 365 дней — ${price[3]}₽ (${Math.round(price[3]/12.2)}₽ в месяц)`,
//         Markup.inlineKeyboard([
//             [
//                 Markup.button.callback(`${price[0]}₽ (30 дней)`, 'pay30'),
//                 Markup.button.callback(`${price[1]}₽ (90 дней)`, 'pay90')
//             ],[
//                 Markup.button.callback(`${price[2]}₽ (180 дней)`, 'pay180'),
//                 Markup.button.callback(`${price[3]}₽ (365 дней)`, 'pay365')
//             ]])
//     )
// }

export const handlePay = () => async (ctx) => {
    await ctx.reply(`Платежная система времнно недоступна.\n` +
        'Попробуйте позже или свяжитесь с поддержкой бота')
    await ctx.reply(adminMessage)

}