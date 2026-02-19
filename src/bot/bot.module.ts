import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { BotUpdate } from './bot.update'
import { StartCommand } from './commands/start.command'
import { User } from '../system/user/entity/user.entity'

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [BotUpdate, StartCommand],
})
export class BotModule {}
