import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { handleTextMessage, handleVoiceMessage } from './handlers/message.js'
import {
    handleNewCommand,
    handleSettingsCommand,
    handleStartCommand
} from './handlers/command.js'
import {
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

bot.action('voice', handleReplayTypeSelection('voice','🔈 Голос'))
bot.action('text', handleReplayTypeSelection('text','💬 Текст'))

bot.action('ermil', handleSelectedVoice('ermil','👨🏼 Эмиль'))
bot.action('alena', handleSelectedVoice('alena','👩🏼 Алёна'))
bot.action('filipp', handleSelectedVoice('filipp','👨🏼 Филипп'))
bot.action('jane', handleSelectedVoice('jane','👩🏼 Джейн'))
bot.action('madirus', handleSelectedVoice('madirus','👨🏼 Мадирос'))

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