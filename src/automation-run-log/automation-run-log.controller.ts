import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { UserAuth, UserAuthType } from '@common/decorators/auth.helpers'
import { UserDecorator } from '../system/user/decorators/user.decorator'
import { User } from '../system/user/entity/user.entity'
import { AutomationRunLogService } from './automation-run-log.service'
import { AutomationRunLog } from './entities/automation-run-log.entity'

@Controller('automation-run-log')
@ApiTags('Automation run logs')
export class AutomationRunLogController {
    constructor(private readonly automationRunLogService: AutomationRunLogService) {}

    @Get()
    @UserAuth(UserAuthType.USER)
    @ApiOperation({ summary: 'List run logs (optionally by userAutomationId)' })
    @ApiResponse({ status: 200, type: [AutomationRunLog] })
    findAll(@UserDecorator() user: User, @Query('userAutomationId') userAutomationId?: string) {
        return this.automationRunLogService.findAllForUser(user.id, userAutomationId)
    }

    @Get(':id')
    @UserAuth(UserAuthType.USER)
    @ApiOperation({ summary: 'Get run log by id' })
    @ApiResponse({ status: 200, type: AutomationRunLog })
    findOne(@UserDecorator() user: User, @Param('id') id: string) {
        return this.automationRunLogService.findOneForUser(user.id, id)
    }
}
