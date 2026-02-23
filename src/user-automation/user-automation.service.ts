import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
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
import { NotificationService } from '../notification/notification.service'
import { TriggerTypeEnum } from './enum/trigger-type.enum'
import { AutomationRunLog } from '../automation-run-log/entities/automation-run-log.entity'

@Injectable()
export class UserAutomationService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(UserAutomationService.name)
    private readonly retryLastByAutomation = new Map<string, number>()
    private pendingMonitorTimer?: NodeJS.Timeout
    private schedulerTimer?: NodeJS.Timeout

    constructor(
        @InjectRepository(UserAutomation)
        private readonly userAutomationRepository: Repository<UserAutomation>,
        @InjectRepository(AutomationRunLog)
        private readonly automationRunLogRepository: Repository<AutomationRunLog>,
        private readonly automationRunLogService: AutomationRunLogService,
        private readonly n8nService: N8nService,
        private readonly billingService: BillingService,
        private readonly configService: ConfigService,
        private readonly notificationService: NotificationService,
    ) {}

    onModuleInit() {
        const pendingMonitorIntervalMs =
            Number(this.configService.get<string>('AUTOMATION_PENDING_CHECK_INTERVAL_MS', '60000')) || 60000

        this.pendingMonitorTimer = setInterval(() => {
            void this.failStalePendingRuns().catch((error) => {
                const message = error instanceof Error ? error.message : String(error)
                this.logger.error(`Pending monitor failed: ${message}`)
            })
        }, pendingMonitorIntervalMs)
        this.pendingMonitorTimer.unref?.()

        const schedulerIntervalMs =
            Number(this.configService.get<string>('AUTOMATION_SCHEDULER_INTERVAL_MS', '30000')) || 30000

        this.schedulerTimer = setInterval(() => {
            void this.runScheduledAutomations().catch((error) => {
                const message = error instanceof Error ? error.message : String(error)
                this.logger.error(`Scheduler loop failed: ${message}`)
            })
        }, schedulerIntervalMs)
        this.schedulerTimer.unref?.()
    }

    onModuleDestroy() {
        if (this.pendingMonitorTimer) {
            clearInterval(this.pendingMonitorTimer)
            this.pendingMonitorTimer = undefined
        }
        if (this.schedulerTimer) {
            clearInterval(this.schedulerTimer)
            this.schedulerTimer = undefined
        }
    }

    create(userId: string, dto: CreateUserAutomationDto) {
        const normalized = this.normalizeScheduleForPersist(dto.triggerType, dto.scheduleConfig)
        const entity = this.userAutomationRepository.create({
            ...dto,
            userId,
            scheduleConfig: normalized ?? undefined,
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
        const nextTriggerType = (updateUserAutomationDto.triggerType ?? automation.triggerType) as TriggerTypeEnum
        const nextScheduleSource = updateUserAutomationDto.scheduleConfig ?? automation.scheduleConfig
        const normalized = this.normalizeScheduleForPersist(nextTriggerType, nextScheduleSource)

        const updated = this.userAutomationRepository.merge(automation, {
            ...updateUserAutomationDto,
            triggerType: nextTriggerType,
            scheduleConfig: normalized ?? undefined,
        })

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

            const telegramId = automation.user?.telegramId
            if (telegramId) {
                try {
                    await this.notificationService.notify(
                        telegramId,
                        `Завершена автоматизация.\nСтатус: Ошибка\nОшибка: ${errorMessage}`,
                    )
                } catch (notifyError) {
                    const notifyMessage =
                        notifyError instanceof Error ? notifyError.message : String(notifyError)
                    this.logger.warn(`Failed to send error notification: ${notifyMessage}`)
                }
            }

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

    private async runScheduledAutomations() {
        const now = new Date()
        const automations = await this.userAutomationRepository.find({
            where: [{ triggerType: TriggerTypeEnum.SCHEDULE }, { triggerType: TriggerTypeEnum.BATCH }],
            order: { updatedAt: 'ASC' },
        })

        for (const automation of automations) {
            const schedule = this.normalizeScheduleRuntime(automation.triggerType, automation.scheduleConfig)
            if (!schedule) {
                continue
            }

            const due = this.isDueToRun(schedule, now)
            if (!due) {
                continue
            }

            const hasActiveRun = await this.automationRunLogRepository.exist({
                where: {
                    userAutomationId: automation.id,
                    status: In([RunLogStatusEnum.PENDING, RunLogStatusEnum.RUNNING]),
                },
            })

            if (hasActiveRun) {
                continue
            }

            try {
                await this.run(automation.userId, automation.id, { parameters: {} })

                const patch = this.getSchedulePatchAfterDispatch(automation.triggerType, schedule, now)
                if (patch) {
                    await this.userAutomationRepository.update(
                        { id: automation.id },
                        {
                            ...patch,
                            updatedAt: new Date(),
                        },
                    )
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error)
                this.logger.warn(`Scheduled run failed for automation ${automation.id}: ${message}`)
            }
        }
    }

    private normalizeScheduleForPersist(
        triggerType: TriggerTypeEnum,
        rawSchedule?: Record<string, any>,
    ): Record<string, any> | null {
        const now = new Date()
        const schedule = rawSchedule ?? {}
        const mode = this.resolveMode(triggerType, schedule?.mode)

        if (mode === 'manual') {
            return { mode: 'manual' }
        }

        if (mode === 'interval') {
            const intervalHours = this.clampInt(schedule.intervalHours, 1, 24, 1)
            const nextRunAt = new Date(now.getTime() + intervalHours * 60 * 60 * 1000).toISOString()

            return {
                mode,
                intervalHours,
                nextRunAt,
            }
        }

        if (mode === 'daily') {
            const dailyTime = this.normalizeDailyTime(schedule.dailyTime)
            const nextRunAt = this.computeNextDailyRun(dailyTime, now).toISOString()

            return {
                mode,
                dailyTime,
                nextRunAt,
            }
        }

        const batchCount = this.clampInt(schedule.batchCount, 1, 50, 1)
        const batchDelayMinutes = this.clampInt(schedule.batchDelayMinutes, 0, 1440, 0)

        return {
            mode: 'batch',
            batchCount,
            batchDelayMinutes,
            batchRemaining: batchCount,
            nextRunAt: now.toISOString(),
        }
    }

    private normalizeScheduleRuntime(
        triggerType: TriggerTypeEnum,
        rawSchedule?: Record<string, any>,
    ): Record<string, any> | null {
        const schedule = rawSchedule ?? {}
        const mode = this.resolveMode(triggerType, schedule?.mode)

        if (mode === 'manual') {
            return null
        }

        if (mode === 'interval') {
            return {
                mode,
                intervalHours: this.clampInt(schedule.intervalHours, 1, 24, 1),
                nextRunAt: this.readValidDate(schedule.nextRunAt),
            }
        }

        if (mode === 'daily') {
            return {
                mode,
                dailyTime: this.normalizeDailyTime(schedule.dailyTime),
                nextRunAt: this.readValidDate(schedule.nextRunAt),
            }
        }

        return {
            mode: 'batch',
            batchCount: this.clampInt(schedule.batchCount, 1, 50, 1),
            batchDelayMinutes: this.clampInt(schedule.batchDelayMinutes, 0, 1440, 0),
            batchRemaining: this.clampInt(schedule.batchRemaining, 0, 50, this.clampInt(schedule.batchCount, 1, 50, 1)),
            nextRunAt: this.readValidDate(schedule.nextRunAt),
        }
    }

    private isDueToRun(schedule: Record<string, any>, now: Date): boolean {
        if (schedule.mode === 'interval') {
            const nextRunAt = schedule.nextRunAt ?? new Date(0)
            return nextRunAt.getTime() <= now.getTime()
        }

        if (schedule.mode === 'daily') {
            const nextRunAt = schedule.nextRunAt ?? this.computeNextDailyRun(schedule.dailyTime, now)
            return nextRunAt.getTime() <= now.getTime()
        }

        if (schedule.mode === 'batch') {
            if ((schedule.batchRemaining ?? 0) <= 0) {
                return false
            }
            const nextRunAt = schedule.nextRunAt ?? now
            return nextRunAt.getTime() <= now.getTime()
        }

        return false
    }

    private getSchedulePatchAfterDispatch(
        triggerType: TriggerTypeEnum,
        schedule: Record<string, any>,
        now: Date,
    ): Partial<UserAutomation> | null {
        if (schedule.mode === 'interval') {
            const intervalHours = this.clampInt(schedule.intervalHours, 1, 24, 1)
            return {
                scheduleConfig: {
                    mode: 'interval',
                    intervalHours,
                    nextRunAt: new Date(now.getTime() + intervalHours * 60 * 60 * 1000).toISOString(),
                },
            }
        }

        if (schedule.mode === 'daily') {
            const dailyTime = this.normalizeDailyTime(schedule.dailyTime)
            return {
                scheduleConfig: {
                    mode: 'daily',
                    dailyTime,
                    nextRunAt: this.computeNextDailyRun(dailyTime, now).toISOString(),
                },
            }
        }

        if (schedule.mode === 'batch' || triggerType === TriggerTypeEnum.BATCH) {
            const batchCount = this.clampInt(schedule.batchCount, 1, 50, 1)
            const batchDelayMinutes = this.clampInt(schedule.batchDelayMinutes, 0, 1440, 0)
            const remaining = this.clampInt(schedule.batchRemaining, 0, 50, batchCount)
            const nextRemaining = Math.max(remaining - 1, 0)

            if (nextRemaining === 0) {
                return {
                    triggerType: TriggerTypeEnum.MANUAL,
                    scheduleConfig: { mode: 'manual' },
                }
            }

            return {
                scheduleConfig: {
                    mode: 'batch',
                    batchCount,
                    batchDelayMinutes,
                    batchRemaining: nextRemaining,
                    nextRunAt: new Date(now.getTime() + batchDelayMinutes * 60 * 1000).toISOString(),
                },
            }
        }

        return null
    }

    private resolveMode(
        triggerType: TriggerTypeEnum,
        rawMode?: string,
    ): 'manual' | 'interval' | 'daily' | 'batch' {
        if (triggerType === TriggerTypeEnum.MANUAL) {
            return 'manual'
        }
        if (triggerType === TriggerTypeEnum.BATCH) {
            return 'batch'
        }
        if (rawMode === 'daily') {
            return 'daily'
        }
        return 'interval'
    }

    private clampInt(value: any, min: number, max: number, fallback: number): number {
        const n = Number(value)
        if (!Number.isFinite(n)) {
            return fallback
        }
        return Math.min(max, Math.max(min, Math.trunc(n)))
    }

    private normalizeDailyTime(value: any): string {
        const raw = String(value ?? '').trim()
        if (!/^\d{2}:\d{2}$/.test(raw)) {
            return '06:00'
        }
        const [hoursRaw, minutesRaw] = raw.split(':')
        const hours = this.clampInt(hoursRaw, 0, 23, 6)
        const minutes = this.clampInt(minutesRaw, 0, 59, 0)
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }

    private computeNextDailyRun(dailyTime: string, now: Date): Date {
        const [hoursRaw, minutesRaw] = dailyTime.split(':')
        const hours = this.clampInt(hoursRaw, 0, 23, 6)
        const minutes = this.clampInt(minutesRaw, 0, 59, 0)
        const next = new Date(now)
        next.setSeconds(0, 0)
        next.setHours(hours, minutes, 0, 0)

        if (next.getTime() <= now.getTime()) {
            next.setDate(next.getDate() + 1)
        }
        return next
    }

    private readValidDate(value: any): Date | null {
        if (!value) {
            return null
        }
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
            return null
        }
        return date
    }


    private async failStalePendingRuns() {
        const pendingTimeoutMs =
            Number(this.configService.get<string>('AUTOMATION_PENDING_TIMEOUT_MS', '900000')) || 900000
        const runningTimeoutMs =
            Number(this.configService.get<string>('AUTOMATION_RUNNING_TIMEOUT_MS', '1800000')) || 1800000

        const stalePendingRuns = await this.automationRunLogService.findByStatusOlderThan(
            RunLogStatusEnum.PENDING,
            new Date(Date.now() - pendingTimeoutMs),
        )
        const staleRunningRuns = await this.automationRunLogService.findByStatusOlderThan(
            RunLogStatusEnum.RUNNING,
            new Date(Date.now() - runningTimeoutMs),
        )

        if (!stalePendingRuns.length && !staleRunningRuns.length) {
            return
        }

        const markTimedOutRuns = async (
            runs: typeof stalePendingRuns,
            timeoutMs: number,
            timeoutStatus: 'pending' | 'running',
        ) => {
            const errorMessage = `Execution timed out in ${timeoutStatus} after ${Math.round(timeoutMs / 1000)}s`

            for (const run of runs) {
                await this.automationRunLogService.update(run.id, {
                    status: RunLogStatusEnum.ERROR,
                    errorMessage,
                    endTime: new Date().toISOString(),
                })

                const telegramId = run.userAutomation?.user?.telegramId
                if (telegramId) {
                    await this.notificationService.notify(
                        telegramId,
                        `Automation finished.\nStatus: Error\nError: ${errorMessage}`,
                    )
                }
            }
        }

        await markTimedOutRuns(stalePendingRuns, pendingTimeoutMs, 'pending')
        await markTimedOutRuns(staleRunningRuns, runningTimeoutMs, 'running')

        if (stalePendingRuns.length) {
            this.logger.warn(`Marked ${stalePendingRuns.length} stale pending run(s) as error`)
        }
        if (staleRunningRuns.length) {
            this.logger.warn(`Marked ${staleRunningRuns.length} stale running run(s) as error`)
        }
    }
}
