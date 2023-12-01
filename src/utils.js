import { unlink } from 'fs/promises'
import config from 'config'
import { Markup } from 'telegraf'
import { get_encoding } from "tiktoken"

const maxToken = config.get('MAX_TOKEN')

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

export function subscribeDay(totalSeconds) {
    const now = nowTimeSecond()
    if(totalSeconds > now) {
        const day = Math.floor((Number(totalSeconds) - now) / (60 * 60 * 24))
        return `✅ ${day}д.`
    } else {
        return '❌'
    }
}

export async function replaySubscribe(ctx) {
    return await ctx.replyWithMarkdown(`*Эта функия доступна только по подписке*
    
Сейчас подписка — Не активна 😢
        
Ты можешь оформить подписку на бота прямо сейчас!`,
        Markup.inlineKeyboard([Markup.button.callback(`❓ О подписке`, 'plan')])
    )
}

export async function checkTokens (messages) {

    try {
        const encoding = get_encoding("cl100k_base")
        const stringMessages = JSON.stringify(messages)
        const tokens = encoding.encode(stringMessages).length


        if (tokens <= maxToken) {
            return messages
        }

        let conditionMet = false
        while (!conditionMet) {
            let stringMessages = JSON.stringify(messages)
            let tokens = encoding.encode(stringMessages).length
            if (tokens <= maxToken) {
                conditionMet = true
            } else {
                messages.splice(0, 2)
            }
        }
        return messages

    } catch (e) {
        console.log( 'Ошибка проверки токенов и обработки контекста: ', e )
        return messages
    }
}
