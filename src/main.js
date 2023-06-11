import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { handleTextMessage, handleVoiceMessage } from './handlers/message.js'
import {
    handleNewCommand, handlePlanCommand, handleProfileCommand,
    handleSettingsCommand,
    handleStartCommand
} from './handlers/command.js'
import {
    handlePay,
    handleReplayTypeSelection,
    handleSelectedVoice
} from './handlers/action.js'
import config from 'config'
import process from 'nodemon'


const telegramToken = config.get('TELEGRAM_TOKEN')

if (!telegramToken) {
    throw new Error('Отсутствует Телеграмм-токен в файле конфигурации')
}

const bot = new Telegraf(telegramToken)

bot.use(session())

bot.command('new', handleNewCommand)
bot.command('start', handleStartCommand)
bot.command('settings', handleSettingsCommand)
bot.command('profile', handleProfileCommand)
bot.command('plan', handlePlanCommand)

bot.action('voice', handleReplayTypeSelection('voice','🔈 Голос'))
bot.action('text', handleReplayTypeSelection('text','💬 Текст'))

bot.action('ermil', handleSelectedVoice('ermil','👨🏼 Эмиль'))
bot.action('alena', handleSelectedVoice('alena','👩🏼 Алёна'))
bot.action('filipp', handleSelectedVoice('filipp','👨🏼 Филипп'))
bot.action('jane', handleSelectedVoice('jane','👩🏼 Джейн'))
bot.action('madirus', handleSelectedVoice('madirus','👨🏼 Мадирос'))

bot.action('pay', handlePay())
bot.action('plan', handlePlanCommand)
// bot.action('pay30', handlePay('30'))
// bot.action('pay90', handlePay('90'))
// bot.action('pay180', handlePay('180'))
// bot.action('pay365', handlePay('365'))

bot.on(message('voice'), handleVoiceMessage)
bot.on(message('text'), handleTextMessage)

bot.catch((error) => {
    console.error('Telegraf error', error)
})

function stopBot(signal) {
    console.log(`Stop signal received: ${signal}`)
    bot.stop(signal)
}

process.once('SIGINT', () => stopBot('SIGINT'))
process.once('SIGTERM', () => stopBot('SIGTERM'))

bot.launch()