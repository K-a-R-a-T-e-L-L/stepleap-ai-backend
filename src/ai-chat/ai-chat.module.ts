import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { BillingModule } from '../billing/billing.module'
import { FileModule } from '../file/file.module'
import { NotificationModule } from '../notification/notification.module'
import { AiChatController } from './ai-chat.controller'
import { AiChatService } from './ai-chat.service'
import { GptChatMessage } from './entities/gpt-chat-message.entity'
import { SoraChatRun } from './entities/sora-chat-run.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature([GptChatMessage, SoraChatRun]),
        BillingModule,
        FileModule,
        NotificationModule,
    ],
    controllers: [AiChatController],
    providers: [AiChatService],
})
export class AiChatModule {}
