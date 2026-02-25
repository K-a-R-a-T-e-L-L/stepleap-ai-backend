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

    findAllForUser(userId: string, userAutomationId?: string) {
        const qb = this.automationRunLogRepository
            .createQueryBuilder('runLog')
            .leftJoinAndSelect('runLog.stepEvents', 'stepEvents')
            .leftJoinAndSelect('runLog.userAutomation', 'userAutomation')
            .where('userAutomation.userId = :userId', { userId })
            .orderBy('runLog.createdAt', 'DESC')

        if (userAutomationId) {
            qb.andWhere('runLog.userAutomationId = :userAutomationId', { userAutomationId })
        }

        return qb.getMany()
    }

    async findOne(id: string) {
        const runLog = await this.automationRunLogRepository.findOne({ where: { id } })

        if (!runLog) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND)
        }

        return runLog
    }

    async findOneForUser(userId: string, id: string) {
        const runLog = await this.automationRunLogRepository
            .createQueryBuilder('runLog')
            .leftJoinAndSelect('runLog.stepEvents', 'stepEvents')
            .leftJoinAndSelect('runLog.userAutomation', 'userAutomation')
            .where('runLog.id = :id', { id })
            .andWhere('userAutomation.userId = :userId', { userId })
            .getOne()

        if (!runLog) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND)
        }

        return runLog
    }

    async update(id: string, updateAutomationRunLogDto: UpdateAutomationRunLogDto) {
        await this.findOne(id)

        // Avoid merge/save here: merge may include eager relation side effects and null out FK fields.
        const patch = Object.fromEntries(
            Object.entries(updateAutomationRunLogDto).filter(([, value]) => value !== undefined),
        ) as UpdateAutomationRunLogDto

        if (!Object.keys(patch).length) {
            return this.findOne(id)
        }

        await this.automationRunLogRepository.update({ id }, patch)
        return this.findOne(id)
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

    async findByStatusOlderThan(status: RunLogStatusEnum, before: Date) {
        return this.automationRunLogRepository.find({
            where: {
                status,
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
