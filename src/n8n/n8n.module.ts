import { forwardRef, Module } from '@nestjs/common'

import { N8nService } from './n8n.service'
import { N8nController } from './n8n.controller'
import { AutomationRunLogModule } from '../automation-run-log/automation-run-log.module'
import { BillingModule } from '../billing/billing.module'
import { AutomationResultModule } from '../automation-result/automation-result.module'
import { UserAutomationModule } from '../user-automation/user-automation.module'

@Module({
    imports: [AutomationRunLogModule, BillingModule, AutomationResultModule, forwardRef(() => UserAutomationModule)],
    controllers: [N8nController],
    providers: [N8nService],
    exports: [N8nService],
})
export class N8nModule {}
