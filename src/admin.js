import {allPromo, allUser, countPromo, countUser, profileUser} from './db.js'
import { Markup } from 'telegraf'
import { subscribeDay } from './utils.js'

const ITEMS_PER_PAGE = 5

const adminKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback('👤‍ Все пользователи', 'usersPage:1')
    ],[
        Markup.button.callback('🔍 Поиск по ID', 'search'),
        Markup.button.callback('✉️ Рассылка', 'mailing')
    ],
    [
        Markup.button.callback('🏷‍ Промокоды', 'promoPage:1')
    ]
])

export const adminPanel = async (ctx) => {
    const userCount = await countUser()
    await ctx.replyWithMarkdown(`*Админ панель*
    
Привет ${ctx.from.first_name}

Всего пользователей: ${userCount}`, adminKeyboard)
}


export const handleCommandAdmin = async (ctx) => {
    const profile = await profileUser(ctx.message.from.id, ctx.message.from.first_name)

    if (profile.role === 'admin') {
        await adminPanel(ctx)
    } else {
        await ctx.reply('Команда недоступна')
    }
}

export const handleAllUser = async (ctx, page = 1) => {
    try {
        const totalCount = await countUser()
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
        const offset = (page - 1) * ITEMS_PER_PAGE
        const users = await allUser(offset,ITEMS_PER_PAGE)
        const keyboard = users.map((user) => {
            const subscribe = subscribeDay(user.subscribe)
            return [
                {
                    text: `${user.name}     ${subscribe}`,
                    callback_data: `info:${user.telegramId}:${page}`
                }
            ]
        })
        const paginationKeyboard = [];
        if (page > 1) {
            paginationKeyboard.push([
                {
                    text: '◀️ Назад',
                    callback_data: `usersPage:${page - 1}`,
                },
            ]);
        }
        if (page < totalPages) {
            paginationKeyboard.push([
                {
                    text: 'Вперед ▶️',
                    callback_data: `usersPage:${page + 1}`,
                },
            ]);
        }

        paginationKeyboard.push([
            {
                text: '⏪️ Админ панель',
                callback_data: `adminPanel`,
            },
        ]);

        await ctx.editMessageText(`Список пользователей (Страница ${page}/${totalPages}):`);
        await ctx.editMessageReplyMarkup({
            inline_keyboard: [...keyboard, ...paginationKeyboard],
        })
    } catch (e) {
        console.error('Ошибка получения списка пользователй: ', e.message)
    }
}

export const handleAllPromo = async (ctx, page = 1) => {
    try {
        const totalCount = await countPromo()
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
        const offset = (page - 1) * ITEMS_PER_PAGE
        const promos = await allPromo(offset,ITEMS_PER_PAGE)
        const keyboard = promos.map((promo) => {
            const validity = subscribeDay(promo.validity)
            return [
                {
                    text: `Промо:   ${promo.code}     Срок: ${validity}`,
                    callback_data: `promoInfo:${promo.id}:${page}`
                }
            ]
        })
        const paginationKeyboard = [];
        if (page > 1) {
            paginationKeyboard.push([
                {
                    text: '◀️ Назад',
                    callback_data: `promoPage:${page - 1}`,
                },
            ]);
        }
        if (page < totalPages) {
            paginationKeyboard.push([
                {
                    text: 'Вперед ▶️',
                    callback_data: `promoPage:${page + 1}`,
                },
            ]);
        }

        paginationKeyboard.push([
            {
                text: '⏪️ Админ панель',
                callback_data: `adminPanel`,
            }
        ])
        paginationKeyboard.push([
            {
                text: '➕ Новый промокод',
                callback_data: `newPromo`,
            }
        ])

        await ctx.editMessageText(`Список Промокодов (Страница ${page}/${totalPages}):`);
        await ctx.editMessageReplyMarkup({
            inline_keyboard: [...keyboard, ...paginationKeyboard],
        })
    } catch (e) {
        console.error('Ошибка получения списка пользователй: ', e.message)
    }
}