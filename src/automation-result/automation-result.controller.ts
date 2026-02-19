import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AutomationResultService } from './automation-result.service'
import { AutomationResult } from './entities/automation-result.entity'

@ApiTags('Automation results')
@Controller('automation-results')
export class AutomationResultController {
    constructor(private readonly automationResultService: AutomationResultService) {}

    @Get()
    @ApiOperation({ summary: 'List results by runLogId' })
    @ApiResponse({ status: 200, type: [AutomationResult] })
    list(@Query('runLogId') runLogId: string) {
        return this.automationResultService.findByRunLog(runLogId)
    }
}
