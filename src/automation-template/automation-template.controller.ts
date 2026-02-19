import { Controller, Get, Param } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AutomationTemplateService } from './automation-template.service'
import { AutomationTemplate } from './entities/automation-template.entity'

@Controller('templates')
@ApiTags('Automation templates')
export class AutomationTemplateController {
    constructor(private readonly automationTemplateService: AutomationTemplateService) {}

    @Get()
    @ApiOperation({ summary: 'List automation templates' })
    @ApiResponse({ status: 200, type: [AutomationTemplate] })
    findAll() {
        return this.automationTemplateService.findAll()
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get automation template by id' })
    @ApiResponse({ status: 200, type: AutomationTemplate })
    findOne(@Param('id') id: string) {
        return this.automationTemplateService.findOne(id)
    }

}
