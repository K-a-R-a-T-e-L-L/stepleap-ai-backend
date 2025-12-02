import { Body, Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserDockGetManyNotPaginate, UserDockPost } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { CreateChatDto } from '../dto/create-chat.dto'
import { Chat } from '../entity/chat.entity'
import { ChatService } from '../services/chat.service'

@Controller('chats')
@ApiTags('Chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @UserDockPost('', UserAuthType.ADMIN, CreateChatDto, Chat, 'Создать чат')
    async createChat(@Body() createChatDto: CreateChatDto) {
        return this.chatService.save(createChatDto)
    }

    @UserDockGetManyNotPaginate('', UserAuthType.USER, Chat, 'Получить список чатов')
    async getChats() {
        return this.chatService.find()
    }
}
