import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { AutomationResult } from './entities/automation-result.entity'

@Injectable()
export class AutomationResultService {
    constructor(
        @InjectRepository(AutomationResult)
        private readonly automationResultRepository: Repository<AutomationResult>,
    ) {}

    create(dto: Partial<AutomationResult>) {
        const entity = this.automationResultRepository.create(dto)
        return this.automationResultRepository.save(entity)
    }

    findByRunLog(runLogId: string) {
        return this.automationResultRepository.find({
            where: { runLogId },
            order: { createdAt: 'DESC' },
        })
    }
}
