import { Scenes } from 'telegraf'
import { Markup } from 'telegraf'
import {handlePay} from "../handlers/pay.js";

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

}

export const scene = new Scene()