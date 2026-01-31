import { Injectable } from '@nestjs/common'
import { fetch } from 'undici'

import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'

@Injectable()
export class N8nService {
    async executeWebhook(webhookUrl?: string, payload?: Record<string, any>) {
        if (!webhookUrl) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'n8n webhook URL is not configured')
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload ?? {}),
        })

        if (!response.ok) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, `n8n webhook error: ${response.status}`)
        }

        const data: any = await response.json().catch(() => ({}))

        return {
            executionId: data?.executionId ?? data?.execution_id ?? null,
            raw: data,
        }
    }
}
