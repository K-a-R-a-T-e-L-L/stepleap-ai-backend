import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AutomationRunLogService } from '../automation-run-log/automation-run-log.service'
import { NotificationService } from '../notification/notification.service'
import { BillingService } from '../billing/billing.service'
import { AutomationResultService } from '../automation-result/automation-result.service'
import { RunLogStatusEnum } from '../automation-run-log/enum/run-log-status.enum'
import { N8nCallbackDto } from './dto/n8n-callback.dto'
import { UserAutomationService } from '../user-automation/user-automation.service'
import { N8nProgressCallbackDto } from './dto/n8n-progress-callback.dto'
import { AutomationRunStepEventService } from '../automation-run-log/automation-run-step-event.service'

@Controller('n8n')
@ApiTags('n8n')
export class N8nController {
    constructor(
        private readonly automationRunLogService: AutomationRunLogService,
        private readonly notificationService: NotificationService,
        private readonly billingService: BillingService,
        private readonly automationResultService: AutomationResultService,
        private readonly userAutomationService: UserAutomationService,
        private readonly automationRunStepEventService: AutomationRunStepEventService,
    ) {}

    @Post('progress-callback')
    @ApiOperation({ summary: 'Receive n8n step progress callback' })
    @ApiResponse({ status: 200, description: 'Progress callback received' })
    async progressCallback(@Body() dto: N8nProgressCallbackDto) {
        const event = await this.automationRunStepEventService.record({
            runLogId: dto.runLogId,
            stepCode: dto.stepCode,
            status: dto.status,
            message: dto.message,
            progress: dto.progress,
            seq: dto.seq,
            idempotencyKey: dto.idempotencyKey,
            rawPayload: dto.rawPayload,
        })

        return { ok: true, eventId: event.id }
    }

    @Post('callback')
    @ApiOperation({ summary: 'Receive n8n execution callback' })
    @ApiResponse({ status: 200, description: 'Callback received' })
    async callback(@Body() dto: N8nCallbackDto) {
        const existingRunLog = await this.automationRunLogService.findOne(dto.runLogId)
        if (
            existingRunLog.status === RunLogStatusEnum.SUCCESS ||
            existingRunLog.status === RunLogStatusEnum.ERROR
        ) {
            return { ok: true, ignored: true }
        }

        const runLog = await this.automationRunLogService.update(dto.runLogId, {
            status: dto.status as RunLogStatusEnum,
            errorMessage: dto.errorMessage,
            endTime: new Date().toISOString(),
        })

        const userId = runLog.userAutomation?.userId
        const userAutomationId = runLog.userAutomationId

        if (dto.status === RunLogStatusEnum.ERROR && userId && userAutomationId) {
            this.userAutomationService.scheduleAutoRetry(userId, userAutomationId, 'n8n-callback')
        }

        if (dto.usageLineItems?.length && userId) {
            await this.billingService.recordUsage(
                userId,
                runLog.id,
                dto.usageLineItems,
                dto.idempotencyKey,
                dto.rawPayload,
            )
        }

        if (dto.outputUrl) {
            await this.automationResultService.create({
                runLogId: runLog.id,
                outputUrl: dto.outputUrl,
                payload: dto.rawPayload,
            })
        }

        const telegramId = runLog.userAutomation?.user?.telegramId
        if (telegramId) {
            const statusText = dto.status === 'success' ? 'Успешно' : 'Ошибка'
            const errorText = dto.errorMessage ? `\nОшибка: ${dto.errorMessage}` : ''
            const outputText = dto.outputUrl ? `\nРезультат: ${dto.outputUrl}` : ''

            await this.notificationService.notify(
                telegramId,
                `Завершена автоматизация.\nСтатус: ${statusText}${errorText}${outputText}`,
            )
        }

        return { ok: true }
    }
}
