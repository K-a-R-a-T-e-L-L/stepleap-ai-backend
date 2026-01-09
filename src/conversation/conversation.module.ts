import { Module } from '@nestjs/common'
import { ConversationService } from './services/conversation.service'
import { ConversationsController } from './conversation.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Conversation } from './entities/conversation.entity'
import { Message } from './entities/message.entity'
import { AiModule } from 'src/ai/ai.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
    imports: [TypeOrmModule.forFeature([Conversation, Message]), AiModule, JwtModule],
    providers: [ConversationService],
    controllers: [ConversationsController],
})
export class ConversationModule {}
