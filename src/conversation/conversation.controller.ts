import { UserAuth, UserAuthType } from '@common/decorators/auth.helpers'
import {
    UserDockGetMany,
    UserDockGetManyNotPaginate,
    UserDockGetOne,
    UserDockPost,
} from '@common/swagger/user.swagger.helper'
import { Body, Controller, Param } from '@nestjs/common'
import { Conversation } from './entities/conversation.entity'
import { UserDecorator } from 'src/system/user/decorators/user.decorator'
import { ConversationService } from './services/conversation.service'
import { User } from 'src/system/user/entity/user.entity'
import { SendMessageDto } from './dto/send-message.dto'
import { CreateConversationResponseDto } from './dto/create-conversation-response.dto'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { Message } from './entities/message.entity'

@Controller('conversations')
export class ConversationsController {
    constructor(private readonly conversationService: ConversationService) {}

    @UserDockPost('', UserAuthType.USER, null, Conversation)
    async createConversation(@UserDecorator() user: User, @Body() createConversationDto: CreateConversationDto) {
        return this.conversationService.createConversation(user, createConversationDto)
    }

    @UserDockGetManyNotPaginate('', UserAuthType.USER, Conversation)
    async getUserConversations(@UserDecorator() user: User) {
        return this.conversationService.getUserConversations(user)
    }

    @UserDockPost(':conversationId', UserAuthType.USER, SendMessageDto, Message)
    async sendUserMessageToConversation(
        @UserDecorator() user: User,
        @Body() sendMessageDto: SendMessageDto,
        @Param('conversationId') conversationId: string,
    ) {
        return this.conversationService.sendUserMessageToConversation(user, sendMessageDto, conversationId)
    }

    @UserDockGetOne(':conversationId/history', UserAuthType.USER, [Message])
    async getConversationHistory(@UserDecorator() user: User, @Param('conversationId') conversationId: string) {
        return this.conversationService.getConversationHistory(conversationId)
    }
}
