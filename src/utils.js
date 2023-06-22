import { unlink } from 'fs/promises'
import { Markup, Scenes } from 'telegraf'
import { message } from 'telegraf/filters'

export async function removeFile(path) {
    try {
        await unlink(path)
    } catch (e) {
        console.log('Ошибка удаления файла: ', e.message)
    }
}

export function nowTimeSecond() {
    const currentDate = new Date()
    return Math.floor(currentDate.getTime() / 1000)
}

export function convertSeconds(totalSeconds) {
    const days = Math.floor(totalSeconds / (60 * 60 * 24))
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)

    return `Активна ✅
Осталось: ${days} дней, ${hours}часов, ${minutes}минут`
}

export function addSubSeconds(days) {
    return nowTimeSecond() + (days * 24 * 60 * 60)
}

export function dayToSeconds(days) {
    return days * 24 * 60 * 60
}

export async function replaySubscribe(ctx) {
    return await ctx.replyWithMarkdown(`*Эта функия доступна только по подписке*
    
Сейчас подписка — Не активна 😢
        
Ты можешь оформить подписку на бота прямо сейчас!`,
        Markup.inlineKeyboard([Markup.button.callback(`❓ О подписке`, 'plan')])
    )
}
