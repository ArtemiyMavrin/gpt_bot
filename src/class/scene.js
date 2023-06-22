import { Scenes } from 'telegraf'
import { message } from 'telegraf/filters'
import {handlePay} from "../handlers/pay.js";

class Scene {
    constructor() {
    }

    PhoneScene () {
        const sPhone = new Scenes.BaseScene('sPhone')
        sPhone.enter(async (ctx) =>{
            await ctx.replyWithMarkdown(`*Введите номер в формате:* _79008887766_`, )
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