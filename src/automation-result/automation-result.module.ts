import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AutomationResultService } from './automation-result.service'
import { AutomationResult } from './entities/automation-result.entity'
import { AutomationResultController } from './automation-result.controller'

@Module({
    imports: [TypeOrmModule.forFeature([AutomationResult])],
    controllers: [AutomationResultController],
    providers: [AutomationResultService],
    exports: [AutomationResultService],
})
export class AutomationResultModule {}
