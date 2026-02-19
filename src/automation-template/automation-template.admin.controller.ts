import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { UserAuth, UserAuthType } from '@common/decorators/auth.helpers'
import { AutomationTemplateService } from './automation-template.service'
import { CreateAutomationTemplateDto } from './dto/create-automation-template.dto'
import { UpdateAutomationTemplateDto } from './dto/update-automation-template.dto'
import { AutomationTemplate } from './entities/automation-template.entity'

@ApiTags('Admin templates')
@Controller('admin/templates')
export class AutomationTemplateAdminController {
    constructor(private readonly automationTemplateService: AutomationTemplateService) {}

    @Post()
    @UserAuth(UserAuthType.ADMIN)
    @ApiOperation({ summary: 'Create automation template' })
    @ApiResponse({ status: 201, type: AutomationTemplate })
    create(@Body() createAutomationTemplateDto: CreateAutomationTemplateDto) {
        return this.automationTemplateService.create(createAutomationTemplateDto)
    }

    @Patch(':id')
    @UserAuth(UserAuthType.ADMIN)
    @ApiOperation({ summary: 'Update automation template by id' })
    @ApiResponse({ status: 200, type: AutomationTemplate })
    update(@Param('id') id: string, @Body() updateAutomationTemplateDto: UpdateAutomationTemplateDto) {
        return this.automationTemplateService.update(id, updateAutomationTemplateDto)
    }

    @Delete(':id')
    @UserAuth(UserAuthType.ADMIN)
    @ApiOperation({ summary: 'Delete automation template by id' })
    remove(@Param('id') id: string) {
        return this.automationTemplateService.remove(id)
    }
}
