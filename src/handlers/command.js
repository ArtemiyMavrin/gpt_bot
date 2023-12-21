import { Markup } from 'telegraf'
import { checkSubscribe, createUser, profileUser} from '../db.js'
import { convertSeconds, nowTimeSecond } from '../utils.js'
import config from "config"
import { helpCommand } from '../help.js'

const price = config.get('ONE_PRICE')


export const handleNewCommand = async (ctx) => {
    ctx.session.messages = []
    await ctx.reply('Контекст сброшен. Можно начать диалог заново')

}

export const handleStartCommand = async (ctx) => {
    ctx.session.messages = []
    await createUser(ctx.from.id, ctx.from.first_name)
    const welcomeMessage = `
Привет! 👋
Добро пожаловать в Telegram Бот 
Chat GPT-4 Turbo!
    
🎩 ChatGPT-4 Turbo — самая современная модель ИИ (Искуственного интелекта) 

ℹ️ Более подробно о возможностях ИИ можно узнать в разделе 
"Как пользоваться?"

🎧 Бот понимает голосовые сообщения.
    
🔈 Бот может отвечать текстом или голосом. По умолчанию текстом (можно изменить в разделе "Настройки").
    
🎙 В настройках можно выбрать голос, которым бот будет отвечать.
    
🔄 Бот запоминает контекст беседы. Если нужно начать диалог заново и просто чтобы бот забыл, о чем была беседа, просто выбери в меню команду "Сбросить контекст".
    
💬 Начни прямо сейчас! Напиши боту все что угодно или задай вопрос голосом.`

    await ctx.reply(welcomeMessage)
}

export const commands = [
    { command: '/start', description: '▶️ Перезапустить бота' },
    { command: '/new', description: '🆕 Сбросить контекст' },
    { command: '/settings', description: '⚙️ Настройки бота' },
    { command: '/profile', description: '👤 Профиль' },
    { command: '/help', description: 'ℹ️ Как пользоваться?' },
    { command: '/plan', description: '💳 Подписка' }
]

export const handleSettingsCommand = async (ctx) => {
    await ctx.reply(
        'Я могу отвечвть голосом или текстом. По умолчанию это текст. Что выберешь?',
        Markup.inlineKeyboard([
            Markup.button.callback('🔈 Голос', 'voice'),
            Markup.button.callback('💬 Текст', 'text')
        ])
    )
}

export const handlePlanCommand = async (ctx) => {
    const checkSub = await checkSubscribe(ctx.from.id, ctx.from.first_name)
    let subscribe = 'Не активна 😢'
    let buttonText = 'Оформить'
    if(checkSub) {
        subscribe = 'Активна ✅'
        buttonText = 'Продлить'
    }
    await ctx.replyWithMarkdown(`Сейчас подписка ${subscribe}
    
*Подписка это:*
— Доступ к *Chat GPT4 Turbo* без ограничений
— Ответы без очереди
— Возможность задавать вопросы голосом
— Озвучка ответов от *Chat GPT4 Turbo*

🎁 В подарок при оплате подписки вы получаете *бесплатный* доступ ко второму нашему боту 
@Translator\\\_Voice\\\_Bot — бот переведет в текст пересланные ему голосовые сообщения или "кружки" или озвучит текст отправленный ему🎁 
        
Вы можете ${buttonText} подписку на бота прямо сейчас!

💥Действует *скидка 20%* при оплате переводом. 
Перейдите к оплате чтобы узнать точную сумму`,
        Markup.inlineKeyboard([Markup.button.callback(`💳 ${buttonText} подписку — за ${price}₽`, 'selectPay')])
    )
}

export const handleProfileCommand = async (ctx) => {
    const user = await profileUser(ctx.from.id, ctx.from.first_name)
    const checkSub = await checkSubscribe(ctx.from.id, ctx.from.first_name)
    let subscribe = 'Не активна 😢'
    let buttonText = 'Оформить'
    if (checkSub) {
        const checkTime = Number(user.subscribe) - nowTimeSecond()
        subscribe = convertSeconds(checkTime)
        buttonText = 'Продлить'
    }
    await ctx.replyWithMarkdown(`👤 *Профиль:*
    
*ID:* \`${user.telegramId}\`
*Имя:* ${user.name}
*Подписка:* ${subscribe}`,Markup.inlineKeyboard([Markup.button.callback(`💳 ${buttonText} подписку — за ${price}₽`, 'selectPay')]))
}

export const handleHelpCommand = async (ctx) => {
    await helpCommand
}
