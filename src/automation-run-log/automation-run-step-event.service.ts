import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { RunLogStatusEnum } from './enum/run-log-status.enum'
import { RunStepStatusEnum } from './enum/run-step-status.enum'
import { AutomationRunLogService } from './automation-run-log.service'
import { AutomationRunStepEvent } from './entities/automation-run-step-event.entity'

type RecordStepEventInput = {
    runLogId: string
    stepCode: string
    status: RunStepStatusEnum
    message?: string
    progress?: number
    seq?: number
    idempotencyKey?: string
    rawPayload?: Record<string, any>
}

@Injectable()
export class AutomationRunStepEventService {
    constructor(
        @InjectRepository(AutomationRunStepEvent)
        private readonly stepEventRepository: Repository<AutomationRunStepEvent>,
        private readonly automationRunLogService: AutomationRunLogService,
    ) {}

    async record(input: RecordStepEventInput) {
        if (typeof input.seq === 'number') {
            const bySeq = await this.stepEventRepository.findOne({
                where: { runLogId: input.runLogId, seq: input.seq },
            })
            if (bySeq) {
                return bySeq
            }
        }

        if (input.idempotencyKey) {
            const existing = await this.stepEventRepository.findOne({
                where: { idempotencyKey: input.idempotencyKey },
            })
            if (existing) {
                return existing
            }
        }

        const runLog = await this.automationRunLogService.findOne(input.runLogId)
        const templateSteps = runLog.userAutomation?.template?.steps || []
        const matchedStep = templateSteps.find((step) => step.code === input.stepCode)

        const event = await this.stepEventRepository.save({
            runLogId: runLog.id,
            templateStepId: matchedStep?.id,
            stepCode: input.stepCode,
            stepTitle: matchedStep?.title || input.stepCode,
            stepTitleRu: matchedStep?.titleRu,
            stepTitleEn: matchedStep?.titleEn,
            status: input.status,
            message: input.message,
            progress: input.progress,
            seq: input.seq,
            idempotencyKey: input.idempotencyKey,
            rawPayload: input.rawPayload,
        })

        if (runLog.status === RunLogStatusEnum.PENDING) {
            await this.automationRunLogService.update(runLog.id, {
                status: RunLogStatusEnum.RUNNING,
            })
        }

        return event
    }
}
