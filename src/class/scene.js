import { Scenes } from 'telegraf'
import { Markup } from 'telegraf'
import { handlePay } from "../handlers/pay.js"
import {profileUser} from "../db.js";

class Scene {
    constructor() {
    }

    PhoneScene () {
        const sPhone = new Scenes.BaseScene('sPhone')
        sPhone.enter(async (ctx) =>{
            await ctx.replyWithMarkdownV2(`*Напишите Ваш номер телефона*

Это нужно платежной системе чтобы прислать вам чек\\.
Мы нигде не храним ваши данные

*Введите номер в формате\\:* _79008887766_`,
                Markup.inlineKeyboard([
                    Markup.button.callback('Отмена', 'cancel')
                ]))
        })
        sPhone.action('cancel', async (ctx) => {
            await ctx.answerCbQuery()
            await ctx.editMessageText('Оплата отменена.')
            await ctx.scene.leave()
        })
        sPhone.on('text', async (ctx) => {
            const phone = Number(ctx.message.text)
            if (phone && phone > 0) {
                if (ctx.message.text.length < 11){
                    await ctx.replyWithMarkdown(`*Нехвататет цифр.*`)
                    await ctx.scene.reenter()
                } else {
                    await handlePay(ctx, phone)
                    await ctx.scene.leave()
                }
            } else {
                await ctx.replyWithMarkdown(`*Номер не распознан*`)
                await ctx.scene.reenter()
            }
        })
        sPhone.on('message', async (ctx) => {
            await ctx.replyWithMarkdown(`*Это не похоже на номер телефона*`)
        })
        return sPhone
    }

    SearchScene () {
        const sSearch = new Scenes.BaseScene('sSearch')
        sSearch.enter(async (ctx) =>{
            await ctx.replyWithMarkdownV2(`*Напишите ID пользователя цифрами*`,
                Markup.inlineKeyboard([
                    Markup.button.callback('Отмена', 'cancel')
                ]))
        })
        sSearch.action('cancel', async (ctx) => {
            await ctx.answerCbQuery()
            await ctx.editMessageText('Поиск отменен.')
            await ctx.scene.leave()
        })
        sSearch.on('text', async (ctx) => {
            const searchId = Number(ctx.message.text)
            if (searchId && searchId > 0) {
                const user = await profileUser(searchId, 'nocreate')
                if (!user) {
                    await ctx.replyWithMarkdownV2(`*Пользователи не найдены*`)
                } else {
                    await ctx.replyWithMarkdownV2(`*Найденые пользователи:*`,
                        Markup.inlineKeyboard([
                            Markup.button.callback(`${searchId}`, `info:${searchId}:1`)
                        ]))
                }
                await ctx.scene.leave()
            } else {
                await ctx.replyWithMarkdown(`*ID пользователя не распознан*`)
                await ctx.scene.reenter()
            }
        })
        sSearch.on('message', async (ctx) => {
            await ctx.replyWithMarkdown(`*Это не похоже на ID пользователя*`)
        })
        return sSearch
    }

}

export const scene = new Scene()