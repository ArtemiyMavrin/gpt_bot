import {profilePromo, profileUser, promoRemove, subscribePay} from './db.js'
import { subscribeDay } from './utils.js'
import { Markup } from 'telegraf'
import { helpCommand, helpGpt } from './help.js'
import { handleAllUser, adminPanel, handleAllPromo } from './admin.js'

export const callbacks = async (ctx) => {
    const data = ctx.callbackQuery.data

    if (data.startsWith('info:')) {
        try {
            const userId = Number(data.split(':')[1])
            const page = data.split(':')[2]
            const user = await profileUser(userId)
            const subscribe = subscribeDay(user.subscribe)
            const addSubscribeKeyboard = Markup.inlineKeyboard([
                [
                    Markup.button.callback('+ 30 дней', `addSub:${user.telegramId}:${user.name}:30`),
                    Markup.button.callback('+ 90 дней', `addSub:${user.telegramId}:${user.name}:90`),
                    Markup.button.callback('+ 180 дней', `addSub:${user.telegramId}:${user.name}:180`)
                ],
                [
                    Markup.button.callback('◀️ К списку пользователей', `usersPage:${page}`)
                ],
                [
                    Markup.button.callback('⏪️ Админ панель', `adminPanel`)
                ]
            ])
            const text = `*Пользователь:*
            
*ID:* ${user.id}
*Telegram ID:* \`${user.telegramId}\`
*Имя:* ${user.name}
*Роль:* ${user.role}
*Подписка:* ${subscribe}

Продлить подписку:`
            await ctx.deleteMessage()
            ctx.replyWithMarkdown(text, addSubscribeKeyboard)

        } catch (e) {
            console.error('Ошибка получения пользователя: ', e.message)
        }
    }

    if (data.startsWith('promoInfo:')) {
        try {
            const promoId = Number(data.split(':')[1])
            const page = data.split(':')[2]
            const promo = await profilePromo(promoId)
            const validity = subscribeDay(promo.validity)
            const addSubscribeKeyboard = Markup.inlineKeyboard([
                [
                    Markup.button.callback('❌ Удалить промокод', `promoRemove:${promo.id}`)

                ],
                [
                    Markup.button.callback('◀️ К списку промокодов', `promoPage:${page}`)
                ],
                [
                    Markup.button.callback('⏪️ Админ панель', `adminPanel`)
                ]
            ])
            const text = `*Промокод:*
            
*ID:* ${promo.id}
*Код:* \`${promo.code}\`
*Тип:* ${promo.type}
*Значение:* ${promo.meaning}
*Срок действия:* ${validity}
`
            await ctx.deleteMessage()
            ctx.replyWithMarkdown(text, addSubscribeKeyboard)

        } catch (e) {
            console.error('Ошибка получения промокода: ', e.message)
        }
    }


    if (data.startsWith('addSub:')) {
        try {
            const id = data.split(':')[1]
            const name = data.split(':')[2]
            const day = data.split(':')[3]
            await subscribePay(id,name,day)
            await ctx.answerCbQuery('Подписка продлена успешно')

        } catch (e) {
            console.error('Ошибка продления подписки: ', e.message)
            await ctx.answerCbQuery('Ошибка продления подписки')
        }
    }

    if (data.startsWith('usersPage:')) {
        const page = parseInt(data.split(':')[1])
        await handleAllUser(ctx, page)
    }

    if (data.startsWith('promoPage:')) {
        const page = parseInt(data.split(':')[1])
        await handleAllPromo(ctx, page)
    }

    if (data.startsWith('promoRemove:')) {
        const id = parseInt(data.split(':')[1])
        const remove = await promoRemove(id)
        if (!remove) {
            await ctx.answerCbQuery('Что-то пошло не так')
        } else {
            await ctx.answerCbQuery('Промокод успешно удален')
        }
    }

    if (data.startsWith('adminPanel')) {
        await ctx.deleteMessage()
        await adminPanel(ctx)
    }

    if (data.startsWith('sendPayGood:')) {
        try {
            const idSend = data.split(':')[1]
            await ctx.telegram.sendMessage(idSend,`*Подписка успешно продлена*
            
Спасибо за оплату подписки\\.  
Вы можете продолжить пользоваться ботом`,
                {
                    parse_mode: "MarkdownV2",
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: "👤 Открыть профиль",
                                callback_data: `profile`
                            }]
                        ]
                    }
                })
            await ctx.answerCbQuery('Подписка успешно продлена.')
            await ctx.deleteMessage()
        } catch (error) {
            console.error('Ошибка при обработке sendPayGood:', error)
            await ctx.answerCbQuery('Произошла ошибка при продлении подписки.');
        }
    }

    if (data.startsWith('search')) {
        await ctx.scene.enter('sSearch')
    }

    if (data.startsWith('newPromo')) {
        await ctx.scene.enter('sNewPromo')
    }

    if (data.startsWith('helpBotPage:')) {
        const page = parseInt(data.split(':')[1])
        await helpGpt(ctx, page, 'helpBotPage')
    }

    if (data.startsWith('helpGptPage:')) {
        const page = parseInt(data.split(':')[1])
        await helpGpt(ctx, page, 'helpGptPage')
    }

    if (data.startsWith('helpPanel')) {
        await ctx.deleteMessage()
        await helpCommand(ctx)
    }


}