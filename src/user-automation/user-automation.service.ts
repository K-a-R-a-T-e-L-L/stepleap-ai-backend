import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ConfigService } from '@nestjs/config'

import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { UserAutomation } from './entities/user-automation.entity'
import { CreateUserAutomationDto } from './dto/create-user-automation.dto'
import { UpdateUserAutomationDto } from './dto/update-user-automation.dto'
import { AutomationRunLogService } from '../automation-run-log/automation-run-log.service'
import { N8nService } from '../n8n/n8n.service'
import { RunAutomationDto } from './dto/run-automation.dto'
import { RunLogStatusEnum } from '../automation-run-log/enum/run-log-status.enum'
import { BillingService } from '../billing/billing.service'

@Injectable()
export class UserAutomationService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(UserAutomationService.name)
    private readonly retryLastByAutomation = new Map<string, number>()
    private pendingMonitorTimer?: NodeJS.Timeout

    constructor(
        @InjectRepository(UserAutomation)
        private readonly userAutomationRepository: Repository<UserAutomation>,
        private readonly automationRunLogService: AutomationRunLogService,
        private readonly n8nService: N8nService,
        private readonly billingService: BillingService,
        private readonly configService: ConfigService,
    ) {}

    onModuleInit() {
        const intervalMs =
            Number(this.configService.get<string>('AUTOMATION_PENDING_CHECK_INTERVAL_MS', '60000')) || 60000

        this.pendingMonitorTimer = setInterval(() => {
            void this.failStalePendingRuns()
        }, intervalMs)
        this.pendingMonitorTimer.unref?.()
    }

    onModuleDestroy() {
        if (this.pendingMonitorTimer) {
            clearInterval(this.pendingMonitorTimer)
            this.pendingMonitorTimer = undefined
        }
    }

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
            status: RunLogStatusEnum.PENDING,
        })

        const payload = {
            automationId: automation.id,
            runLogId: runLog.id,
            parameters: {
                ...(automation.parameters ?? {}),
                ...(dto?.parameters ?? {}),
            },
        }

        let n8nResult: { executionId?: string | null } | undefined
        try {
            n8nResult = await this.n8nService.executeWebhook(automation.template?.n8nId, payload)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Run dispatch failed'
            await this.automationRunLogService.update(runLog.id, {
                status: RunLogStatusEnum.ERROR,
                errorMessage,
                endTime: new Date().toISOString(),
            })
            this.scheduleAutoRetry(userId, automation.id, 'backend-dispatch')
            throw error
        }

        if (n8nResult?.executionId) {
            await this.automationRunLogService.update(runLog.id, {
                n8nExecutionId: n8nResult.executionId,
            })
        }

        return runLog
    }

    scheduleAutoRetry(userId: string, automationId: string, source: 'backend-dispatch' | 'n8n-callback') {
        const enabled = this.configService.get<string>('AUTOMATION_RETRY_ENABLED', 'true') !== 'false'
        if (!enabled) {
            return false
        }

        const delayMs = Number(this.configService.get<string>('AUTOMATION_RETRY_DELAY_MS', '30000')) || 30000
        const cooldownMs =
            Number(this.configService.get<string>('AUTOMATION_RETRY_COOLDOWN_MS', '300000')) || 300000
        const now = Date.now()
        const last = this.retryLastByAutomation.get(automationId) ?? 0

        if (now - last < cooldownMs) {
            return false
        }

        this.retryLastByAutomation.set(automationId, now)
        setTimeout(async () => {
            try {
                await this.run(userId, automationId, { parameters: {} })
                this.logger.log(`Auto-retry success for automation ${automationId} (${source})`)
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                this.logger.warn(`Auto-retry failed for automation ${automationId}: ${errorMessage}`)
            }
        }, delayMs)

        return true
    }

    private async failStalePendingRuns() {
        const timeoutMs = Number(this.configService.get<string>('AUTOMATION_PENDING_TIMEOUT_MS', '900000')) || 900000
        const staleBefore = new Date(Date.now() - timeoutMs)
        const affected = await this.automationRunLogService.failPendingOlderThan(
            staleBefore,
            `Execution timed out after ${Math.round(timeoutMs / 1000)}s`,
        )

        if (affected > 0) {
            this.logger.warn(`Marked ${affected} stale pending run(s) as error`)
        }
    }
}
