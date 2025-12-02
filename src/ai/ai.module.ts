import { Module } from '@nestjs/common'
import { AiController } from './controllers/ai.controller'
import { AiService } from './services/ai.service'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Conversation } from './entities/conversation.entity'
import { ConversationService } from './services/conversation.service'
import { Message } from './entities/message.entity'
import { FileModule } from '../file/file.module'
import { File } from '../file/entity/file.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Conversation, Message, File]), JwtModule, FileModule],
    controllers: [AiController],
    providers: [AiService, ConversationService],
})
export class AiModule {}
