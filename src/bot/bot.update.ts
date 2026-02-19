import { Command, Ctx, InjectBot, Start, Update } from 'nestjs-telegraf'

import { TelegrafContext } from '@common/interfaces/context.interface'
import { UserService } from '../system/user/services/user.service'
import { OnModuleInit } from '@nestjs/common'
import { Markup, Telegraf } from 'telegraf'
import { TelegramLoggerService } from '../logger/logger.service'
import { StartCommand } from './commands/start.command'

@Update()
export class BotUpdate implements OnModuleInit {
    constructor(
        private readonly userService: UserService,
        private readonly logger: TelegramLoggerService,
        @InjectBot() private readonly bot: Telegraf,
        private readonly startCommand: StartCommand,
    ) {}

    onModuleInit() {
        this.logger.log('Bot module initialized', BotUpdate.name)
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
                Markup.button.webApp('Открыть прод', 'https://ai.alexlnos.com'),
                Markup.button.webApp('Открыть дев', 'https://localhost.ru:3000'),
            ]),
        })
    }
}
