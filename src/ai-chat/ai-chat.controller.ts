import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'

import { UserAuth, UserAuthType } from '@common/decorators/auth.helpers'
import { UserDecorator } from '../system/user/decorators/user.decorator'
import { User } from '../system/user/entity/user.entity'
import { AiChatService } from './ai-chat.service'
import { CreateChatDialogDto } from './dto/create-chat-dialog.dto'
import { CreateGptChatDto } from './dto/create-gpt-chat.dto'
import { CreateSoraChatDto } from './dto/create-sora-chat.dto'
import { ListChatDialogsDto } from './dto/list-chat-dialogs.dto'
import { ChatDialog } from './entities/chat-dialog.entity'
import { GptChatMessage } from './entities/gpt-chat-message.entity'
import { SoraChatRun } from './entities/sora-chat-run.entity'

@Controller('chat')
@ApiTags('Chat')
@UserAuth(UserAuthType.USER)
export class AiChatController {
    constructor(private readonly aiChatService: AiChatService) {}

    @Post('dialogs')
    @ApiOperation({ summary: 'Create chat dialog' })
    @ApiResponse({ status: 201, type: ChatDialog })
    createDialog(@UserDecorator() user: User, @Body() dto: CreateChatDialogDto) {
        return this.aiChatService.createDialog(user.id, dto)
    }

    @Get('dialogs')
    @ApiOperation({ summary: 'List chat dialogs for current user' })
    @ApiResponse({ status: 200, type: [ChatDialog] })
    listDialogs(@UserDecorator() user: User, @Query() query: ListChatDialogsDto) {
        return this.aiChatService.listDialogs(user.id, query.model)
    }

    @Delete('dialogs/:id')
    @ApiOperation({ summary: 'Delete chat dialog' })
    @ApiResponse({ status: 200, type: ChatDialog })
    deleteDialog(@UserDecorator() user: User, @Param('id') id: string) {
        return this.aiChatService.deleteDialog(user.id, id)
    }

    @Post('gpt')
    @ApiOperation({ summary: 'Send a GPT chat message' })
    @ApiResponse({ status: 201, type: GptChatMessage })
    sendGptMessage(@UserDecorator() user: User, @Body() dto: CreateGptChatDto) {
        return this.aiChatService.sendGptMessage(user, dto)
    }

    @Get('gpt')
    @ApiOperation({ summary: 'List GPT chat messages for current user' })
    @ApiResponse({ status: 200, type: [GptChatMessage] })
    @ApiQuery({ name: 'chatDialogId', required: false, type: String })
    listGptMessages(@UserDecorator() user: User, @Query('chatDialogId') chatDialogId?: string) {
        return this.aiChatService.listGptMessages(user.id, chatDialogId)
    }

    @Post('sora')
    @ApiOperation({ summary: 'Start a Sora generation run' })
    @ApiResponse({ status: 201, type: SoraChatRun })
    createSoraRun(@UserDecorator() user: User, @Body() dto: CreateSoraChatDto) {
        return this.aiChatService.createSoraRun(user, dto)
    }

    @Get('sora')
    @ApiOperation({ summary: 'List Sora runs for current user' })
    @ApiResponse({ status: 200, type: [SoraChatRun] })
    @ApiQuery({ name: 'chatDialogId', required: false, type: String })
    listSoraRuns(@UserDecorator() user: User, @Query('chatDialogId') chatDialogId?: string) {
        return this.aiChatService.listSoraRuns(user.id, chatDialogId)
    }

    @Get('sora/:id')
    @ApiOperation({ summary: 'Get Sora run by id for current user' })
    @ApiResponse({ status: 200, type: SoraChatRun })
    findSoraRun(@UserDecorator() user: User, @Param('id') id: string) {
        return this.aiChatService.findSoraRun(user.id, id)
    }

    @Post('sora/:id/send-to-telegram')
    @ApiOperation({ summary: 'Send Sora result video to user Telegram chat' })
    @ApiResponse({ status: 200, schema: { example: { ok: true } } })
    sendSoraRunToTelegram(@UserDecorator() user: User, @Param('id') id: string) {
        return this.aiChatService.sendSoraRunToTelegram(user, id)
    }
}
