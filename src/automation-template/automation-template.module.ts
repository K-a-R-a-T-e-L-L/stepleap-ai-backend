import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AutomationTemplateService } from './automation-template.service'
import { AutomationTemplateController } from './automation-template.controller'
import { AutomationTemplateAdminController } from './automation-template.admin.controller'
import { AutomationTemplate } from './entities/automation-template.entity'

@Module({
    imports: [TypeOrmModule.forFeature([AutomationTemplate])],
    controllers: [AutomationTemplateController, AutomationTemplateAdminController],
    providers: [AutomationTemplateService],
    exports: [AutomationTemplateService],
})
export class AutomationTemplateModule {}
