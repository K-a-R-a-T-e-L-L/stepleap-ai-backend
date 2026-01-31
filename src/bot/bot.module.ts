import { Module } from '@nestjs/common'
import { BotUpdate } from './bot.update'
import { FileModule } from '../file/file.module'
import { FileService } from '../file/services/file.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { File } from '../file/entity/file.entity'
import { StartCommand } from './commands/start.command'

@Module({
    imports: [FileModule, TypeOrmModule.forFeature([File])],
    providers: [BotUpdate, FileService, StartCommand],
})
export class BotModule {}
