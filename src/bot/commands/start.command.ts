import { TelegrafContext } from '@common/interfaces/context.interface'
import { Markup } from 'telegraf'
import { UserService } from '../../system/user/services/user.service'
import { Injectable } from '@nestjs/common'
import { TelegramLoggerService } from '../../logger/logger.service'

@Injectable()
export class StartCommand {
    constructor(
        private readonly userService: UserService,
        private readonly logger: TelegramLoggerService,
    ) {}

    async handle(ctx: TelegrafContext) {
        try {
            let user = await this.userService.getUserByTelegramId(ctx.from.id)

            if (user) {
                let needUpdate = false

                if (user.telegramUsername !== ctx.from.username) {
                    needUpdate = true
                    user.telegramUsername = ctx.from.username
                }
                if (user.telegramFirstName !== ctx.from.first_name) {
                    needUpdate = true
                    user.telegramFirstName = ctx.from.first_name
                }

                if (user.telegramLastName !== ctx.from.last_name) {
                    needUpdate = true
                    user.telegramLastName = ctx.from.last_name
                }

                if (user.telegramIsPremium !== ctx.from.is_premium) {
                    needUpdate = true
                    user.telegramIsPremium = ctx.from.is_premium
                }

                if (user.telegramLanguageCode !== ctx.from.language_code) {
                    needUpdate = true
                    user.telegramLanguageCode = ctx.from.language_code
                }

                await user.save()
            } else {
                user = await this.userService.create({
                    telegramId: ctx.from.id,
                    telegramUsername: ctx.from.username,
                    telegramFirstName: ctx.from.first_name,
                    telegramLastName: ctx.from.last_name,
                    telegramIsPremium: ctx.from.is_premium,
                    telegramLanguageCode: ctx.from.language_code,
                })
            }

            await ctx.reply(`\`\`\`json ${JSON.stringify(user, null, 2)}\`\`\``, {
                parse_mode: 'MarkdownV2',
                ...Markup.inlineKeyboard([
                    Markup.button.webApp('Открыть прод', 'https://bclub.alexlnos.com'),
                    Markup.button.webApp('Открыть дев', 'https://localhost.ru:3000'),
                ]),
            })
        } catch (e) {
            await ctx.reply('Произошла ошибка при создании пользователя')
            this.logger.error(e)
        }
    }
}
