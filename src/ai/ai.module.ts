import { Module } from '@nestjs/common'
// import { AiController } from './controllers/ai.controller'
// import { AiService } from './services/ai.service'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'
// import { Conversation } from './entities/conversation.entity'
// import { ConversationService } from './services/conversation.service'
// import { Message } from './entities/message.entity'
import { FileModule } from '../file/file.module'
import { File } from '../file/entity/file.entity'
import { ChatGPTService } from './ai-providers/chatgpt/chatgpt.service'
import { GeminiService } from './ai-providers/gemini/gemini.service'
import { KlingService } from './ai-providers/kling/kling.service'
import { AiProvidersService } from './ai-providers/ai-providers.service'
import { VeoService } from './ai-providers/gemini/veo.service'

@Module({
    imports: [TypeOrmModule.forFeature([File]), JwtModule, FileModule],
    controllers: [],
    providers: [ChatGPTService, GeminiService, KlingService, AiProvidersService, VeoService],
    exports: [ChatGPTService, GeminiService, KlingService, AiProvidersService, VeoService],
})
export class AiModule {}
