import config from 'config'
import { Markup } from 'telegraf'
import { subscribePay } from '../db.js'

const ytoken = config.get('Y_KASSA_TOKEN')
const price = config.get('ONE_PRICE')
const supportMessage = config.get('SUPPORT_MESSAGE')

const getInvoice = (id, phone) => {
    return {
        chat_id: id,
        title: 'Оплата подписки',
        description: 'Подписка ChatGPT BOT — 30 дней',
        payload: {
            date: new Date(),
            user_id: id,
            provider: 'Ю-касса',
            bot: 'ChatGPT_Bot'
        },
        receipt: {
            customer: {
                phone: phone
            },
            items: [
                {
                    description: "Подписка ChatGPT BOT — 30 дней",
                    quantity: "1",
                    amount: {
                        value: `${price}.00`,
                        currency: "RUB"
                    },
                    vat_code: "1"
                },

            ]
        },
        provider_token: ytoken,
        start_parameter: 'pay',
        currency: 'RUB',
        prices: [{label: '₽', amount: price * 100}]
    }
}

export const handlePayGetPhone = async (ctx) => {
    await ctx.replyWithMarkdown(`*Напишите Ваш номер телефона*

Это нужно платежной системе чтобы прислать вам чек.
Мы нигде не храним ваши данные`, )
    await ctx.scene.enter('sPhone')
}

export const handlePay = async (ctx, phone) => {
    try {
        const invoice = getInvoice(ctx.from.id, phone)
        console.log(invoice)
        if (!invoice.provider_token) {
            throw new Error('Не указан provider_token')
        }
        return ctx.replyWithInvoice(invoice)
    } catch (e) {
        console.log(e.message)
        await ctx.reply(`Платежная система временно недоступна.\n` +
            'Попробуйте позже или свяжитесь с поддержкой бота')
        await ctx.reply(supportMessage)
    }
}

export const preCheckoutQuery = (ctx) => {
    ctx.answerPreCheckoutQuery(true)
}


export const successfulPayment = async (ctx) => {
    await subscribePay(ctx.from.id, ctx.from.first_name,30)
    await ctx.reply('Подписка оплачена ✅ \n\n' +
        'Вы можете проверить срок действия подписки в профиле',
        Markup.inlineKeyboard([Markup.button.callback(`👤 Открыть профиль`, 'profile')]))
}