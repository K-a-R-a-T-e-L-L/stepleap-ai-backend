import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { UserAuth, UserAuthType } from '@common/decorators/auth.helpers'
import { AutomationRunLogService } from './automation-run-log.service'
import { CreateAutomationRunLogDto } from './dto/create-automation-run-log.dto'
import { UpdateAutomationRunLogDto } from './dto/update-automation-run-log.dto'
import { AutomationRunLog } from './entities/automation-run-log.entity'

@Controller('automation-run-log')
@ApiTags('Automation run logs')
export class AutomationRunLogController {
    constructor(private readonly automationRunLogService: AutomationRunLogService) {}

    @Post()
    @UserAuth(UserAuthType.USER)
    @ApiOperation({ summary: 'Create run log' })
    @ApiResponse({ status: 201, type: AutomationRunLog })
    create(@Body() createAutomationRunLogDto: CreateAutomationRunLogDto) {
        return this.automationRunLogService.create(createAutomationRunLogDto)
    }

    @Get()
    @UserAuth(UserAuthType.USER)
    @ApiOperation({ summary: 'List run logs (optionally by userAutomationId)' })
    @ApiResponse({ status: 200, type: [AutomationRunLog] })
    findAll(@Query('userAutomationId') userAutomationId?: string) {
        return this.automationRunLogService.findAll(userAutomationId)
    }

    @Get(':id')
    @UserAuth(UserAuthType.USER)
    @ApiOperation({ summary: 'Get run log by id' })
    @ApiResponse({ status: 200, type: AutomationRunLog })
    findOne(@Param('id') id: string) {
        return this.automationRunLogService.findOne(id)
    }

    @Patch(':id')
    @UserAuth(UserAuthType.USER)
    @ApiOperation({ summary: 'Update run log by id' })
    @ApiResponse({ status: 200, type: AutomationRunLog })
    update(@Param('id') id: string, @Body() updateAutomationRunLogDto: UpdateAutomationRunLogDto) {
        return this.automationRunLogService.update(id, updateAutomationRunLogDto)
    }

    @Delete(':id')
    @UserAuth(UserAuthType.USER)
    @ApiOperation({ summary: 'Delete run log by id' })
    remove(@Param('id') id: string) {
        return this.automationRunLogService.remove(id)
    }
}
