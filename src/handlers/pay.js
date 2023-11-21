import config from 'config'
import { Markup } from 'telegraf'
import { subscribePay } from '../db.js'

const ytoken = config.get('Y_KASSA_TOKEN')
const price = config.get('ONE_PRICE')
const supportMessage = config.get('SUPPORT_MESSAGE')
const cardNumder = config.get('CARD_NUMBER')
const idadmin = config.get('TELEGRAM_ID_ADMIN')

const getInvoice = (id, phone) => {
    return {
        chat_id: id,
        title: 'Оплата подписки',
        description: 'ChatGPT BOT — 30 дней',
        payload: {
            date: new Date(),
            user_id: id,
            provider: 'Ю-касса',
            bot: 'ChatGPT_Bot'
        },
        provider_data:{
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
                    }
                ]
            }
        },
        provider_token: ytoken,
        start_parameter: 'pay',
        currency: 'RUB',
        prices: [{label: '30 дней', amount: price * 100}]
    }
}

export const handlePayGetPhone = async (ctx) => {
    try {
        await ctx.deleteMessage()
        if (!ytoken) {
            throw new Error('Не указан provider_token')
        }
        await ctx.scene.enter('sPhone')
    } catch (e) {
        console.log(e.message)
        await ctx.replyWithMarkdown(`*Платежная система временно недоступна.*
        
Попробуйте позже или выбрать оплату переводом по номеру карты (только РФ)`,
            Markup.inlineKeyboard([Markup.button.callback(`💳 => 💳 Оплатить переводом на карту`, 'cardToCard')]))
    }

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
        await ctx.replyWithMarkdown(`*Платежная система временно недоступна.*
        
Попробуйте позже или выбрать оплату переводом по номеру карты (только РФ)`,
            Markup.inlineKeyboard([Markup.button.callback(`💳 => 💳 Оплатить переводом на карту`, 'cardToCard')]))
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

export const handleCardToCard = async (ctx) => {
    await ctx.deleteMessage()
    await ctx.replyWithMarkdownV2(`*Оплата подписки переводом*
    
Вы можете оплатить подписку переводом на карту со *скидкой 20%*
~${price}~ *${Math.round(price/100*80)}*

Номер карты: 
\`${cardNumder}\`
Сумма перевода:
\`${Math.round(price/100*80)}\`

Вы можете нажать на номер карты или сумму чтобы скопировать в один клик

Подписка активируется в течении 5\\-10 минут\\. В редких случаях до 24 часов \\(Зависит от банка\\)
Вы можете оплатить несколько месяцев подписки отправив сумму кратную \`${Math.round(price/100*80)}\` 

После оплаты, нажмите кнопку *"Я оплатил подписку"*`,
        Markup.inlineKeyboard([Markup.button.callback(`👌 Я оплатил подписку`, 'cardToCardOK')]))

}

export const handleCardToCardOK = async (ctx) => {
    await ctx.deleteMessage()
    await ctx.replyWithMarkdownV2(`*Проверяем оплату*
  
Вы можете продолжить пользоваться ботом\\.
Мы пришлем уведомление как только подписка будет продлена\\.

Обычно подписка активируется в течении 5\\-10 минут\\. В редких случаях до 24 часов \\(Зависит от банка\\)`,
        Markup.inlineKeyboard([Markup.button.callback(`👤 Открыть профиль`, 'profile')]))


    await ctx.telegram.sendMessage(idadmin, `*Пользователь оплатил подписку* 
Имя пользователя: *${ctx.from.first_name}*
ID пользователя: \`${ctx.from.id}\`
Цена пописки: *${Math.round(price/100*80)}* в мес`,
        {
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "Подписка продлена",
                        callback_data: `sendPayGood:${ctx.from.id}`
                    }]
                ]
            }
        })
}


export const handleSelectPay = async (ctx) => {
    await ctx.deleteMessage()
    await ctx.replyWithMarkdownV2(`*Выберите способ оплаты*`,
        Markup.inlineKeyboard(
            [[Markup.button.callback('💳 Оплата картой', 'pay')],
            [Markup.button.callback('💳 => 💳 Оплата переводом (-20%)', 'cardToCard')]]
        ))
}

