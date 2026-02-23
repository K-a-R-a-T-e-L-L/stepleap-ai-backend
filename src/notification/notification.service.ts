import { Injectable } from '@nestjs/common'
import { InjectBot } from 'nestjs-telegraf'
import { Telegraf } from 'telegraf'
import { FmtString } from 'telegraf/format'

@Injectable()
export class NotificationService {
    constructor(@InjectBot() private readonly bot: Telegraf) {
    }

    async notify(chatId: string | number, message: string | FmtString) {
        return await this.bot.telegram.sendMessage(chatId, message)
    }

    async sendVideo(chatId: string | number, videoUrl: string, caption?: string) {
        return await this.bot.telegram.sendVideo(chatId, videoUrl, {
            caption,
            supports_streaming: true,
        })
    }
}
