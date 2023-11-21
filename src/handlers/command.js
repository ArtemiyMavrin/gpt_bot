import { Markup } from 'telegraf'
import { checkSubscribe, createUser, profileUser} from '../db.js'
import { convertSeconds, nowTimeSecond } from '../utils.js'
import config from "config"

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
        
Ты можешь ${buttonText} подписку на бота прямо сейчас!`,
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
    await ctx.reply(`👤 Профиль:
    
ID: ${user.telegramId}
Имя: ${user.name}
Подписка: ${subscribe}`,Markup.inlineKeyboard([Markup.button.callback(`💳 ${buttonText} подписку — за ${price}₽`, 'selectPay')]))
}

export const handleHelpCommand = async (ctx) => {
    ctx.session.messages = []
    await createUser(ctx.from.id, ctx.from.first_name)
    const helpMessage = `
**ChatGPT – это искусственный интеллект, созданный компанией OpenAI на основе архитектуры Generative Pre-trained Transformer (GPT). Вот основные способности и функции, которыми обладает ChatGPT:**

**1. Общение в режиме диалога:** ChatGPT может вести беседы на различные темы, поддерживая нить разговора и адаптируясь к контексту общения.

2. Генерация текстов: Он может писать статьи, рассказы, поэзию, код и другие виды текстов, следуя определённым инструкциям и стилю.

3. Ответы на вопросы: ChatGPT способен отвечать на вопросы, начиная от простых фактических запросов и заканчивая более сложными темами, требующими понимания контекста.

4. Изучение и объяснение концепций: AI может изучать новые понятия и объяснять сложные идеи простым языком.

5. Улучшение обучения: Модель может предложить упражнения, образовательные материалы и объяснения, помогая в обучении.

6. Помощь в программировании: ChatGPT может помочь найти ошибки в коде, предложить способы оптимизации и дать советы по лучшим практикам программирования.

7. Развлечения: Модель может участвовать в играх, создавать шутки, головоломки и другие формы развлечений.

8. Помощь в работе с текстом: ChatGPT может предложить редактирование текстов, корректировку грамматики, стилистики и структуры текста.

9. Поддержка разнообразных языков: GPT способен общаться на многих языках, что делает его полезным инструментом для международного общения и переводов.

10. Адаптация под пользовательские сценарии: Благодаря машинному обучению, ChatGPT может адаптироваться под нужды и предпочтения конкретного пользователя, становясь более персонализированным инструментом общения и помощи.

Стоит отметить, что независимо от версии, все модели GPT имеют определённые ограничения и не всегда способны точно различать достоверную и недостоверную информацию, поэтому их ответы должны проверяться с критической точки зрения.`

    await ctx.replyWithMarkdown(helpMessage)
}
