import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AutomationRunLogService } from './automation-run-log.service'
import { AutomationRunStepEventService } from './automation-run-step-event.service'
import { AutomationRunLogController } from './automation-run-log.controller'
import { AutomationRunLog } from './entities/automation-run-log.entity'
import { AutomationRunStepEvent } from './entities/automation-run-step-event.entity'

@Module({
    imports: [TypeOrmModule.forFeature([AutomationRunLog, AutomationRunStepEvent])],
    controllers: [AutomationRunLogController],
    providers: [AutomationRunLogService, AutomationRunStepEventService],
    exports: [AutomationRunLogService, AutomationRunStepEventService],
})
export class AutomationRunLogModule {}
