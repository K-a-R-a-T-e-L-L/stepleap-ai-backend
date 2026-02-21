import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThan, Repository } from 'typeorm'

import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { AutomationRunLog } from './entities/automation-run-log.entity'
import { CreateAutomationRunLogDto } from './dto/create-automation-run-log.dto'
import { UpdateAutomationRunLogDto } from './dto/update-automation-run-log.dto'
import { RunLogStatusEnum } from './enum/run-log-status.enum'

@Injectable()
export class AutomationRunLogService {
    constructor(
        @InjectRepository(AutomationRunLog)
        private readonly automationRunLogRepository: Repository<AutomationRunLog>,
    ) {}

    create(createAutomationRunLogDto: CreateAutomationRunLogDto) {
        const entity = this.automationRunLogRepository.create(createAutomationRunLogDto)
        return this.automationRunLogRepository.save(entity)
    }

    findAll(userAutomationId?: string) {
        return this.automationRunLogRepository.find({
            where: userAutomationId ? { userAutomationId } : undefined,
            order: { createdAt: 'DESC' },
        })
    }

    async findOne(id: string) {
        const runLog = await this.automationRunLogRepository.findOne({ where: { id } })

        if (!runLog) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND)
        }

        return runLog
    }

    async update(id: string, updateAutomationRunLogDto: UpdateAutomationRunLogDto) {
        const runLog = await this.findOne(id)
        const updated = this.automationRunLogRepository.merge(runLog, updateAutomationRunLogDto)

        return this.automationRunLogRepository.save(updated)
    }

    async remove(id: string) {
        await this.findOne(id)
        await this.automationRunLogRepository.softDelete(id)

        return { id }
    }

    async failPendingOlderThan(before: Date, errorMessage: string) {
        const result = await this.automationRunLogRepository
            .createQueryBuilder()
            .update(AutomationRunLog)
            .set({
                status: RunLogStatusEnum.ERROR,
                errorMessage,
                endTime: () => 'NOW()',
            })
            .where('status = :status', { status: RunLogStatusEnum.PENDING })
            .andWhere('start_time < :before', { before: before.toISOString() })
            .execute()

        return result.affected ?? 0
    }

    async findPendingOlderThan(before: Date) {
        return this.automationRunLogRepository.find({
            where: {
                status: RunLogStatusEnum.PENDING,
                startTime: LessThan(before),
            },
            relations: {
                userAutomation: {
                    user: true,
                },
            },
        })
    }
}
