import { Markup } from 'telegraf'
import { checkSubscribe, createUser, profileUser} from '../db.js'
import { convertSeconds, nowTimeSecond } from '../utils.js'
import config from "config"

const price = config.get('ONE_PRICE')


export const handleNewCommand = async (ctx) => {
    ctx.session = { messages: [] }; await ctx.reply('Контекст сброшен. Можно начать диалог заново')

}

export const handleStartCommand = async (ctx) => {
    ctx.session = { messages: [] }
    await createUser(ctx.message.from.id, ctx.message.from.first_name)
    const welcomeMessage = `
Привет! Добро пожаловать в нашего удивительного телеграм-бота! 👋
    
🎩 Я - ChatGPT 3.5 Turbo, суперинтеллектуальная модель и готов ответить на все твои вопросы и провести увлекательные беседы. 😊
    
🔈 Выбери, как ты предпочитаешь получать ответы от меня: текстом или голосом. По умолчанию я отвечаю текстом.
    
🎙 Настройки чата позволяют тебе выбрать удобный формат, просто перейди в меню бота и выбери "Настройки". В этом разделе можно выбрать, как я буду отвечать. Ты даже можешь выбрать голос, которым я буду отвечать тебе.
    
🔄 Кроме того, я запоминаю контекст беседы, пока мы общаемся. Если хочешь начать диалог заново и просто чтобы я забыл, о чем мы говорили, просто выбери в меню команду "Сбросить контекст".
    
🎧 Если тебе удобнее записывать голосовые сообщения, не беспокойся! Я с радостью прослушаю их и предоставлю тебе подходящие ответы.
    
💡 Моя цель - помочь тебе, развлечь тебя и быть твоим надежным собеседником. Ты можешь спросить меня о чем угодно, от общих знаний до погоды или даже просто поболтать о жизни.
    
💬 Не стесняйся, задавай свои вопросы и наслаждайся общением со мной! Желаю тебе интересных и продуктивных бесед! 💫`

    await ctx.reply(welcomeMessage)
}

export const handleSettingsCommand = async (ctx) => {
    await ctx.reply(
        'Бот может отвечвть голосом или текстом. По умолчанию это текст. Что выберешь?',
        Markup.inlineKeyboard([
            Markup.button.callback('🔈 Голос', 'voice'),
            Markup.button.callback('💬 Текст', 'text')
        ])
    )
}

export const handlePlanCommand = async (ctx) => {
    const checkSub = await checkSubscribe(ctx.from.id)
    let subscribe = 'Не активна 😢'
    let buttonText = 'Оформить'
    if(checkSub) {
        subscribe = 'Активна ✅'
        buttonText = 'Продлить'
    }
    await ctx.replyWithMarkdown(`Сейчас подписка ${subscribe}
    
*Подписка это:*
— Неограниченный доступ к боту
— Ответы без очереди
— Возможность задавать вопросы голосом
— Озвучка ответов бота
        
Ты можешь ${buttonText} подписку на бота прямо сейчас!`,
        Markup.inlineKeyboard([Markup.button.callback(`💳 ${buttonText} подписку — за ${price}₽`, 'pay')])
    )
}

export const handleProfileCommand = async (ctx) => {
    const user = await profileUser(ctx.message.from.id, ctx.message.from.first_name)
    const checkSub = await checkSubscribe(ctx.message.from.id)
    let subscribe = 'Не активна 😢'
    let buttonText = 'Оформить'
    if (checkSub) {
        const checkTime = user.subscribe - nowTimeSecond()
        subscribe = convertSeconds(checkTime)
        buttonText = 'Продлить'
    }
    await ctx.reply(`👤 Профиль:
    
ID: ${user.telegramId}
Имя: ${user.name}
Подписка: ${subscribe}`,Markup.inlineKeyboard([Markup.button.callback(`💳 ${buttonText} подписку — за ${price}₽`, 'pay')]))
}