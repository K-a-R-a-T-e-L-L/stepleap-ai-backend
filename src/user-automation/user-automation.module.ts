import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserAutomationService } from './user-automation.service'
import { UserAutomationController } from './user-automation.controller'
import { UserAutomation } from './entities/user-automation.entity'
import { AutomationRunLogModule } from '../automation-run-log/automation-run-log.module'
import { N8nModule } from '../n8n/n8n.module'
import { BillingModule } from '../billing/billing.module'

@Module({
    imports: [TypeOrmModule.forFeature([UserAutomation]), AutomationRunLogModule, forwardRef(() => N8nModule), BillingModule],
    controllers: [UserAutomationController],
    providers: [UserAutomationService],
    exports: [UserAutomationService],
})
export class UserAutomationModule {}
