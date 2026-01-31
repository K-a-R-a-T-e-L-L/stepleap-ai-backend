import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { UserAutomation } from './entities/user-automation.entity'
import { CreateUserAutomationDto } from './dto/create-user-automation.dto'
import { UpdateUserAutomationDto } from './dto/update-user-automation.dto'
import { AutomationRunLogService } from '../automation-run-log/automation-run-log.service'
import { N8nService } from '../n8n/n8n.service'
import { RunAutomationDto } from './dto/run-automation.dto'
import { BillingService } from '../billing/billing.service'

@Injectable()
export class UserAutomationService {
    constructor(
        @InjectRepository(UserAutomation)
        private readonly userAutomationRepository: Repository<UserAutomation>,
        private readonly automationRunLogService: AutomationRunLogService,
        private readonly n8nService: N8nService,
        private readonly billingService: BillingService,
    ) {}

    create(userId: string, dto: CreateUserAutomationDto) {
        const entity = this.userAutomationRepository.create({
            ...dto,
            userId,
        })

        return this.userAutomationRepository.save(entity)
    }

    findAll(userId: string) {
        return this.userAutomationRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        })
    }

    async findOne(id: string) {
        const automation = await this.userAutomationRepository.findOne({ where: { id } })

        if (!automation) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND)
        }

        return automation
    }

    async update(id: string, updateUserAutomationDto: UpdateUserAutomationDto) {
        const automation = await this.findOne(id)
        const updated = this.userAutomationRepository.merge(automation, updateUserAutomationDto)

        return this.userAutomationRepository.save(updated)
    }

    async remove(id: string) {
        await this.findOne(id)
        await this.userAutomationRepository.softDelete(id)

        return { id }
    }

    async run(userId: string, automationId: string, dto?: RunAutomationDto) {
        const automation = await this.findOne(automationId)

        if (automation.userId !== userId) {
            throw new ErrorDto(ErrorCodeEnum.FORBIDDEN)
        }

        await this.billingService.canRun(
            userId,
            automation.template?.requiredMeters,
            automation.template?.maxUnitsPerRun,
        )

        const runLog = await this.automationRunLogService.create({
            userAutomationId: automation.id,
            status: 'pending',
        })

        const payload = {
            automationId: automation.id,
            runLogId: runLog.id,
            parameters: {
                ...(automation.parameters ?? {}),
                ...(dto?.parameters ?? {}),
            },
        }

        const n8nResult = await this.n8nService.executeWebhook(automation.template?.n8nId, payload)

        if (n8nResult?.executionId) {
            await this.automationRunLogService.update(runLog.id, {
                n8nExecutionId: n8nResult.executionId,
            })
        }

        return runLog
    }
}
