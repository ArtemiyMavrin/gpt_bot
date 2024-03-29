import { Telegraf, session } from 'telegraf'
import { Stage } from 'telegraf/scenes'
import { message } from 'telegraf/filters'
import { handleTextMessage, handleVoiceMessage } from './handlers/message.js'
import {
    commands, handleHelpCommand,
    handleNewCommand,
    handlePlanCommand,
    handleProfileCommand,
    handleSettingsCommand,
    handleStartCommand
} from './handlers/command.js'
import {
    handleReplayTypeSelection,
    handleSelectedVoice
} from './handlers/action.js'
import {
    handleSelectPay,
    handleCardToCardOK,
    handleCardToCard,
    handlePayGetPhone,
    preCheckoutQuery,
    successfulPayment
} from './handlers/pay.js'
import { handleCommandAdmin } from './admin.js'
import { helpCommand, helpGpt } from './help.js'
import { callbacks } from './callbacks.js'
import config from 'config'
import process from 'nodemon'
import { scene } from './class/scene.js'

const phoneScene = scene.PhoneScene()
const searchScene = scene.SearchScene()
const newPromoScene = scene.NewPromoScene()
const stage = new Stage([phoneScene, searchScene, newPromoScene])

const telegramToken = config.get('TELEGRAM_TOKEN')

if (!telegramToken) {
    throw new Error('Отсутствует Телеграмм-токен в файле конфигурации...')
}

const bot = new Telegraf(telegramToken)

bot.use(session())
bot.use(stage.middleware())

bot.telegram.setMyCommands(commands)

bot.command('new', handleNewCommand)
bot.command('start', handleStartCommand)
bot.command('settings', handleSettingsCommand)
bot.command('profile', handleProfileCommand)
bot.command('plan', handlePlanCommand)
bot.command('admin', handleCommandAdmin)
bot.command('help', helpCommand)


bot.action('profile', handleProfileCommand)

bot.action('voice', handleReplayTypeSelection('voice','🔈 Голос'))
bot.action('text', handleReplayTypeSelection('text','💬 Текст'))

bot.action('ermil', handleSelectedVoice('ermil','👨🏼 Эмиль'))
bot.action('alena', handleSelectedVoice('alena','👩🏼 Алёна'))
bot.action('filipp', handleSelectedVoice('filipp','👨🏼 Филипп'))
bot.action('jane', handleSelectedVoice('jane','👩🏼 Джейн'))
bot.action('madirus', handleSelectedVoice('madirus','👨🏼 Мадирос'))

bot.action('plan', handlePlanCommand)
bot.action('selectPay', handleSelectPay)
bot.action('pay', handlePayGetPhone)
bot.action('cardToCard', handleCardToCard)
bot.action('cardToCardOK', handleCardToCardOK)

bot.action('help', helpCommand)
bot.action('helpGpt', helpGpt)

bot.on('pre_checkout_query', preCheckoutQuery)
bot.on('successful_payment', successfulPayment)

bot.on(message('voice'), handleVoiceMessage)
bot.on(message('text'), handleTextMessage)

bot.catch((error) => {
    console.error('Telegraf error', error)
})

bot.on('callback_query', callbacks)

function stopBot(signal) {
    console.log(`Stop signal received: ${signal}`)
    bot.stop(signal)
}

process.once('SIGINT', () => stopBot('SIGINT'))
process.once('SIGTERM', () => stopBot('SIGTERM'))

bot.launch()