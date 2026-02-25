import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { UserAuth, UserAuthType } from '@common/decorators/auth.helpers'
import { UserDecorator } from '../system/user/decorators/user.decorator'
import { User } from '../system/user/entity/user.entity'
import { AutomationResultService } from './automation-result.service'
import { ListResultsByRunLogsDto } from './dto/list-results-by-run-logs.dto'
import { SendResultToTelegramDto } from './dto/send-result-to-telegram.dto'
import { AutomationResult } from './entities/automation-result.entity'

@ApiTags('Automation results')
@Controller('automation-results')
@UserAuth(UserAuthType.USER)
export class AutomationResultController {
    constructor(private readonly automationResultService: AutomationResultService) {}

    @Get()
    @ApiOperation({ summary: 'List results by runLogId' })
    @ApiResponse({ status: 200, type: [AutomationResult] })
    list(@UserDecorator() user: User, @Query('runLogId') runLogId: string) {
        return this.automationResultService.findByRunLogForUser(runLogId, user.id)
    }

    @Post('by-run-logs')
    @ApiOperation({ summary: 'Get latest result output urls by runLogIds for current user' })
    @ApiResponse({ status: 200, schema: { additionalProperties: { type: 'string', nullable: true } } })
    listByRunLogs(@UserDecorator() user: User, @Body() dto: ListResultsByRunLogsDto) {
        return this.automationResultService.findLatestOutputByRunLogsForUser(dto.runLogIds, user.id)
    }

    @Post('send-to-telegram')
    @ApiOperation({ summary: 'Send result video to user Telegram chat' })
    @ApiResponse({ status: 200, schema: { example: { ok: true } } })
    sendToTelegram(@UserDecorator() user: User, @Body() dto: SendResultToTelegramDto) {
        return this.automationResultService.sendToTelegramByRunLog(dto.runLogId, user.id, user.telegramId)
    }
}
