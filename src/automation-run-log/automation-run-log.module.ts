import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AutomationRunLogService } from './automation-run-log.service'
import { AutomationRunLogController } from './automation-run-log.controller'
import { AutomationRunLog } from './entities/automation-run-log.entity'

@Module({
    imports: [TypeOrmModule.forFeature([AutomationRunLog])],
    controllers: [AutomationRunLogController],
    providers: [AutomationRunLogService],
    exports: [AutomationRunLogService],
})
export class AutomationRunLogModule {}
