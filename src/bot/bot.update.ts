import { Command, Ctx, InjectBot, Start, Update } from 'nestjs-telegraf'

import { TelegrafContext } from '@common/interfaces/context.interface'
import { UserService } from '../system/user/services/user.service'
import { InjectS3, S3 } from 'nestjs-s3'
import { FileService } from '../file/services/file.service'
import { OnModuleInit } from '@nestjs/common'
import { Telegraf } from 'telegraf'
import { ConfigService } from '@nestjs/config'
import { Markup } from 'telegraf'
import { TelegramLoggerService } from '../logger/logger.service'
import { StartCommand } from './commands/start.command'

@Update()
export class BotUpdate  {
    constructor(
        private readonly userService: UserService,
        private readonly fileService: FileService,
        private readonly configService: ConfigService,
        private readonly logger: TelegramLoggerService,
        @InjectS3() private readonly s3: S3,
        @InjectBot() private readonly bot: Telegraf,
        private readonly startCommand: StartCommand,
    ) {
        this.logger.setContext(BotUpdate.name)
    }

    @Start()
    async start(@Ctx() ctx: TelegrafContext) {
        await this.startCommand.handle(ctx)
    }

    @Command('me')
    async me(@Ctx() ctx: TelegrafContext) {
        const user = await this.userService.getUserByTelegramId(ctx.from.id)

        if (user) {
            await ctx.reply(`\`\`\`json ${JSON.stringify(user, null, 2)}\`\`\``, { parse_mode: 'MarkdownV2' })
        } else {
            await ctx.reply('Пользователь не найден')
        }
    }

    @Command('links')
    async links(@Ctx() ctx: TelegrafContext) {
        await ctx.reply('Links', {
            parse_mode: 'MarkdownV2',
            ...Markup.inlineKeyboard([
                Markup.button.webApp('Открыть прод', 'https://bclub.alexlnos.com'),
                Markup.button.webApp('Открыть дев', 'https://localhost.ru:3000'),
            ]),
        })
    }
}
