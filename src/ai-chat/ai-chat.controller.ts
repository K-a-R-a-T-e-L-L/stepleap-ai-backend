import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { UserAuth, UserAuthType } from '@common/decorators/auth.helpers'
import { UserDecorator } from '../system/user/decorators/user.decorator'
import { User } from '../system/user/entity/user.entity'
import { AiChatService } from './ai-chat.service'
import { CreateGptChatDto } from './dto/create-gpt-chat.dto'
import { CreateSoraChatDto } from './dto/create-sora-chat.dto'
import { GptChatMessage } from './entities/gpt-chat-message.entity'
import { SoraChatRun } from './entities/sora-chat-run.entity'

@Controller('chat')
@ApiTags('Chat')
@UserAuth(UserAuthType.USER)
export class AiChatController {
    constructor(private readonly aiChatService: AiChatService) {}

    @Post('gpt')
    @ApiOperation({ summary: 'Send a GPT chat message' })
    @ApiResponse({ status: 201, type: GptChatMessage })
    sendGptMessage(@UserDecorator() user: User, @Body() dto: CreateGptChatDto) {
        return this.aiChatService.sendGptMessage(user, dto)
    }

    @Get('gpt')
    @ApiOperation({ summary: 'List GPT chat messages for current user' })
    @ApiResponse({ status: 200, type: [GptChatMessage] })
    listGptMessages(@UserDecorator() user: User) {
        return this.aiChatService.listGptMessages(user.id)
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
    listSoraRuns(@UserDecorator() user: User) {
        return this.aiChatService.listSoraRuns(user.id)
    }

    @Get('sora/:id')
    @ApiOperation({ summary: 'Get Sora run by id for current user' })
    @ApiResponse({ status: 200, type: SoraChatRun })
    findSoraRun(@UserDecorator() user: User, @Param('id') id: string) {
        return this.aiChatService.findSoraRun(user.id, id)
    }
}
