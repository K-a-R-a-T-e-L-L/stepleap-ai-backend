import { Injectable } from '@nestjs/common'
import { TelegrafContext } from '@common/interfaces/context.interface'

@Injectable()
export class StartCommand {
    async handle(ctx: TelegrafContext) {
        await ctx.reply('Добро пожаловать!')
    }
}
