import config from 'config'
import axios from 'axios'

class SpeechKit {

    constructor(apiKey) {

        this.apiKey = apiKey
        this.urlSynthesize = "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize"

    }

    async textToVoice(text,voice) {
        try {
            const params = new URLSearchParams()
            params.append('text', text)
            params.append('lang', 'ru-RU')
            params.append('voice', `${voice}`)
            params.append('format', 'oggopus')
            params.append('emotion', 'good')
            params.append('speed', '1.0')

            const response = await axios({
                method: 'POST',
                url: this.urlSynthesize,
                responseType: 'stream',
                headers: {
                    Authorization: "Api-Key " + this.apiKey,
                },
                data: params
            })

            return response.data

        } catch (e) {
            console.error('Ошибка синтеза речи ',e.message)
            throw e
        }
    }

}

export const speechKit = new SpeechKit(config.get('YANDEX_CLOUD_API_KEY'))