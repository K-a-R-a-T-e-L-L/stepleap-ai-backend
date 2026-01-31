import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AutomationTemplateService } from './automation-template.service'
import { CreateAutomationTemplateDto } from './dto/create-automation-template.dto'
import { UpdateAutomationTemplateDto } from './dto/update-automation-template.dto'
import { AutomationTemplate } from './entities/automation-template.entity'

@Controller('templates')
@ApiTags('Automation templates')
export class AutomationTemplateController {
    constructor(private readonly automationTemplateService: AutomationTemplateService) {}

    @Post()
    @ApiOperation({ summary: 'Create automation template' })
    @ApiResponse({ status: 201, type: AutomationTemplate })
    create(@Body() createAutomationTemplateDto: CreateAutomationTemplateDto) {
        return this.automationTemplateService.create(createAutomationTemplateDto)
    }

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

    @Patch(':id')
    @ApiOperation({ summary: 'Update automation template by id' })
    @ApiResponse({ status: 200, type: AutomationTemplate })
    update(@Param('id') id: string, @Body() updateAutomationTemplateDto: UpdateAutomationTemplateDto) {
        return this.automationTemplateService.update(id, updateAutomationTemplateDto)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete automation template by id' })
    remove(@Param('id') id: string) {
        return this.automationTemplateService.remove(id)
    }
}
