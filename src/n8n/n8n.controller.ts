import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AutomationRunLogService } from '../automation-run-log/automation-run-log.service'
import { NotificationService } from '../notification/notification.service'
import { BillingService } from '../billing/billing.service'
import { N8nCallbackDto } from './dto/n8n-callback.dto'

@Controller('n8n')
@ApiTags('n8n')
export class N8nController {
    constructor(
        private readonly automationRunLogService: AutomationRunLogService,
        private readonly notificationService: NotificationService,
        private readonly billingService: BillingService,
    ) {}

    @Post('callback')
    @ApiOperation({ summary: 'Receive n8n execution callback' })
    @ApiResponse({ status: 200, description: 'Callback received' })
    async callback(@Body() dto: N8nCallbackDto) {
        const runLog = await this.automationRunLogService.update(dto.runLogId, {
            status: dto.status,
            errorMessage: dto.errorMessage,
            endTime: new Date().toISOString(),
        })

        const userId = runLog.userAutomation?.userId

        if (dto.usageLineItems?.length && userId) {
            await this.billingService.recordUsage(
                userId,
                runLog.id,
                dto.usageLineItems,
                dto.idempotencyKey,
                dto.rawPayload,
            )
        }

        const telegramId = runLog.userAutomation?.user?.telegramId
        if (telegramId) {
            const statusText = dto.status === 'success' ? 'Успешно' : 'Ошибка'
            const errorText = dto.errorMessage ? `\nОшибка: ${dto.errorMessage}` : ''
            const outputText = dto.outputUrl ? `\nРезультат: ${dto.outputUrl}` : ''

            await this.notificationService.notify(
                5460431051, //ПОТОМ ЗАМЕНИТЬ НА РИЛ ID
                `Завершена автоматизация.\nСтатус: ${statusText}${errorText}${outputText}`,
            )
        }

        return { ok: true }
    }
}
