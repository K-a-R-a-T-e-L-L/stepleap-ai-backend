// import { Body, Controller, Param, Post, Sse, UseGuards } from '@nestjs/common'
// import { ApiTags } from '@nestjs/swagger'
// import { UserGuard } from '../../system/user/guards/user.guard'
// import { UserDecorator } from '../../system/user/decorators/user.decorator'
// import { User } from '../../system/user/entity/user.entity'
// import { UserDockGetMany, UserDockGetManyNotPaginate, UserDockPost } from '@common/swagger/user.swagger.helper'
// import { UserAuth, UserAuthType } from '@common/decorators/auth.helpers'
// import { Conversation } from '../entities/conversation.entity'
// import { ConversationsPaginated } from '@common/pagination/paginated.configs'
// import { Paginate, PaginateQuery } from 'nestjs-paginate'
// // import { ConversationService } from '../services/conversation.service'
// import { Message } from '../entities/message.entity'
// import { SendMessageDto } from '../dto/send-message.dto'
// import { CreateConversationDto } from '../dto/create-conversation.dto'

// @ApiTags('AI')
// @Controller('ai/conversations')
// export class AiController {
//     constructor() {}

//     @UserDockGetMany(
//         '',
//         UserAuthType.USER,
//         Conversation,
//         ConversationsPaginated,
//         'Получить список всех диалогов пользователя с ИИ',
//     )
//     async get(@UserDecorator() user: User, @Paginate() query: PaginateQuery) {
//         return this.convoService.getUserConversations(user, query)
//     }

//     @UserDockGetManyNotPaginate(
//         ':conversationId/messages',
//         UserAuthType.USER,
//         Message,
//         'Получить все сообщения в конкретном диалоге',
//     )
//     async getConversationMessages(@UserDecorator() user: User, @Param('conversationId') conversationId: string) {
//         return { data: await this.convoService.getConversationMessages(user.id, conversationId) }
//     }

//     @UserDockPost('', UserAuthType.USER, CreateConversationDto, Conversation, 'Создать диалог с ИИ')
//     async post(@UserDecorator() user: User) {
//         return this.convoService.createUserConversation(user)
//     }

//     @Post(':conversationId')
//     @UserAuth(UserAuthType.USER)
//     @Sse()
//     @UseGuards(UserGuard)
//     async sse(
//         @UserDecorator() user: User,
//         @Body() sendMessageDto: SendMessageDto,
//         @Param('conversationId') conversationId: string,
//     ) {
//         console.log(sendMessageDto)

//         return this.convoService.sendUserMessageToConversation(
//             user.id,
//             conversationId,
//             sendMessageDto.model,
//             sendMessageDto.input,
//             sendMessageDto.files,
//         )
//     }
// }
