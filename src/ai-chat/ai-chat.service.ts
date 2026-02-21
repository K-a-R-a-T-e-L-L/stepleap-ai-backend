import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import OpenAI from 'openai'
import { Repository } from 'typeorm'

import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { BillingService } from '../billing/billing.service'
import { FileService } from '../file/services/file.service'
import { NotificationService } from '../notification/notification.service'
import { User } from '../system/user/entity/user.entity'
import { CreateGptChatDto } from './dto/create-gpt-chat.dto'
import {
    CreateSoraChatDto,
    soraDurationVariants,
    soraModelVariants,
    soraSizeVariants,
} from './dto/create-sora-chat.dto'
import { GptChatMessage } from './entities/gpt-chat-message.entity'
import { SoraChatRun } from './entities/sora-chat-run.entity'
import { ChatRunStatusEnum } from './enum/chat-run-status.enum'

type OpenAiVideoStatus = 'queued' | 'in_progress' | 'completed' | 'failed'

@Injectable()
export class AiChatService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(AiChatService.name)
    private readonly openai?: OpenAI
    private pollTimer?: NodeJS.Timeout

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(GptChatMessage)
        private readonly gptChatRepository: Repository<GptChatMessage>,
        @InjectRepository(SoraChatRun)
        private readonly soraChatRunRepository: Repository<SoraChatRun>,
        private readonly billingService: BillingService,
        private readonly fileService: FileService,
        private readonly notificationService: NotificationService,
    ) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY')
        if (apiKey) {
            this.openai = new OpenAI({ apiKey })
        }
    }

    onModuleInit() {
        const intervalMs = Number(this.configService.get<string>('SORA_POLL_INTERVAL_MS', '15000')) || 15000
        this.pollTimer = setInterval(() => {
            void this.pollSoraRuns()
        }, intervalMs)
        this.pollTimer.unref?.()
    }

    onModuleDestroy() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer)
            this.pollTimer = undefined
        }
    }

    async sendGptMessage(user: User, dto: CreateGptChatDto) {
        this.ensureOpenAiEnabled()

        const prompt = dto.prompt?.trim()
        if (!prompt) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'Prompt is required')
        }

        const model = dto.model || this.configService.get<string>('GPT_CHAT_MODEL', 'gpt-4o-mini')
        const maxCompletionTokens =
            dto.maxCompletionTokens ||
            Number(this.configService.get<string>('GPT_CHAT_MAX_COMPLETION_TOKENS', '800')) ||
            800
        const estimatedPromptTokens = this.estimateTokens(prompt)

        await this.billingService.canRun(user.id, ['gpt_prompt', 'gpt_completion'], {
            gpt_prompt: estimatedPromptTokens,
            gpt_completion: maxCompletionTokens,
        })

        const message = await this.gptChatRepository.save({
            userId: user.id,
            prompt,
            model,
            status: ChatRunStatusEnum.PENDING,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
        })

        try {
            const completion = await this.openai!.chat.completions.create({
                model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: maxCompletionTokens,
                temperature: dto.temperature,
            })

            const responseText = completion.choices?.[0]?.message?.content?.trim() || ''
            const promptTokens = completion.usage?.prompt_tokens ?? estimatedPromptTokens
            const completionTokens = completion.usage?.completion_tokens ?? this.estimateTokens(responseText)
            const totalTokens = completion.usage?.total_tokens ?? promptTokens + completionTokens

            const updated = await this.gptChatRepository.save({
                ...message,
                response: responseText,
                status: ChatRunStatusEnum.SUCCESS,
                promptTokens,
                completionTokens,
                totalTokens,
                rawPayload: {
                    id: completion.id,
                    model: completion.model,
                    finishReason: completion.choices?.[0]?.finish_reason,
                },
            })

            await this.billingService.recordUsage(
                user.id,
                updated.id,
                [
                    { meterCode: 'gpt_prompt', qty: promptTokens },
                    { meterCode: 'gpt_completion', qty: completionTokens },
                ],
                `gpt-chat:${updated.id}`,
                { completionId: completion.id },
            )

            return updated
        } catch (error) {
            const description = this.normalizeProviderError(error, 'Failed to generate GPT response')
            await this.gptChatRepository.save({
                ...message,
                status: ChatRunStatusEnum.ERROR,
                errorMessage: description,
            })
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, description)
        }
    }

    listGptMessages(userId: string) {
        return this.gptChatRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        })
    }

    async createSoraRun(user: User, dto: CreateSoraChatDto) {
        this.ensureOpenAiEnabled()

        const prompt = dto.prompt?.trim()
        if (!prompt) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'Prompt is required')
        }

        const seconds = dto.seconds
        const size = dto.size
        const model = dto.model || this.configService.get<string>('SORA_CHAT_MODEL', soraModelVariants[0])

        if (!soraDurationVariants.includes(seconds as any)) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'Invalid seconds value')
        }
        if (!soraSizeVariants.includes(size as any)) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'Invalid size value')
        }
        if (!soraModelVariants.includes(model as any)) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'Invalid model value')
        }

        await this.billingService.canRun(user.id, ['sora_seconds'], {
            sora_seconds: seconds,
        })

        let run: SoraChatRun = await this.soraChatRunRepository.save({
            userId: user.id,
            prompt,
            seconds,
            size,
            model,
            status: ChatRunStatusEnum.PENDING,
            progress: 0,
            usageRecorded: false,
            startedAt: new Date(),
            pollAttempts: 0,
        })

        try {
            const video = await this.openai!.videos.create({
                model: model as any,
                prompt,
                seconds: String(seconds) as any,
                size: size as any,
            })

            run = await this.soraChatRunRepository.save({
                ...run,
                openaiVideoId: video.id,
                status: this.mapVideoStatus(video.status),
                progress: video.progress ?? 0,
                rawPayload: {
                    status: video.status,
                    createdAt: video.created_at,
                    model: video.model,
                    seconds: video.seconds,
                    size: video.size,
                },
            })

            if (video.status === 'completed' || video.status === 'failed') {
                await this.refreshSoraRun(run, user.telegramId)
                return this.findSoraRun(user.id, run.id)
            }

            return run
        } catch (error) {
            const description = this.normalizeProviderError(error, 'Failed to start Sora generation')
            await this.soraChatRunRepository.save({
                ...run,
                status: ChatRunStatusEnum.ERROR,
                errorMessage: description,
                finishedAt: new Date(),
            })
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, description)
        }
    }

    listSoraRuns(userId: string) {
        return this.soraChatRunRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 50,
        })
    }

    async findSoraRun(userId: string, id: string) {
        const run = await this.soraChatRunRepository.findOne({ where: { id, userId } })
        if (!run) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND, 'Sora run not found')
        }
        return run
    }

    private async pollSoraRuns() {
        if (!this.openai) {
            return
        }

        const limit = Number(this.configService.get<string>('SORA_PARALLEL_POLL_LIMIT', '5')) || 5
        const runs = await this.soraChatRunRepository.find({
            where: [
                { status: ChatRunStatusEnum.PENDING },
                { status: ChatRunStatusEnum.RUNNING },
            ],
            order: { updatedAt: 'ASC' },
            take: limit,
        })

        for (const run of runs) {
            try {
                await this.refreshSoraRun(run)
            } catch (error) {
                this.logger.warn(`Failed to refresh Sora run ${run.id}: ${this.extractErrorMessage(error)}`)
            }
        }
    }

    private async refreshSoraRun(run: SoraChatRun, telegramId?: number) {
        if (!run.openaiVideoId) {
            await this.markSoraRunError(run, 'OpenAI video id is missing', telegramId)
            return
        }

        if (!this.openai) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'OpenAI API key is not configured')
        }

        const timeoutMs = Number(this.configService.get<string>('SORA_TIMEOUT_MS', '900000')) || 900000
        if (Date.now() - new Date(run.createdAt).getTime() > timeoutMs) {
            await this.markSoraRunError(run, `Sora generation timed out after ${Math.round(timeoutMs / 1000)}s`, telegramId)
            return
        }

        const video = await this.openai.videos.retrieve(run.openaiVideoId)
        const mappedStatus = this.mapVideoStatus(video.status)

        const updated = await this.soraChatRunRepository.save({
            ...run,
            status: mappedStatus,
            progress: video.progress ?? run.progress ?? 0,
            pollAttempts: (run.pollAttempts || 0) + 1,
            lastPolledAt: new Date(),
            rawPayload: {
                ...(run.rawPayload || {}),
                status: video.status,
                progress: video.progress,
                error: video.error,
                completedAt: video.completed_at,
            },
        })

        if (video.status === 'failed') {
            const message = video.error?.message || 'Sora generation failed'
            await this.markSoraRunError(updated, message, telegramId)
            return
        }

        if (video.status !== 'completed') {
            return
        }

        const downloadResponse = await this.openai.videos.downloadContent(run.openaiVideoId, { variant: 'video' })
        if (!downloadResponse.ok) {
            await this.markSoraRunError(updated, `Sora download failed: HTTP ${downloadResponse.status}`, telegramId)
            return
        }

        const videoBuffer = Buffer.from(await downloadResponse.arrayBuffer())
        const file = await this.fileService.createFileFromBuffer(
            videoBuffer,
            `${run.openaiVideoId}.mp4`,
            'video/mp4',
            'sora',
        )

        const successRun = await this.soraChatRunRepository.save({
            ...updated,
            status: ChatRunStatusEnum.SUCCESS,
            outputUrl: file.originalUrl,
            fileId: file.id,
            finishedAt: new Date(),
            progress: 100,
        })

        if (!successRun.usageRecorded) {
            await this.billingService.recordUsage(
                successRun.userId,
                successRun.id,
                [{ meterCode: 'sora_seconds', qty: successRun.seconds }],
                `sora-chat:${successRun.id}`,
                { openaiVideoId: successRun.openaiVideoId, outputUrl: successRun.outputUrl },
            )
            await this.soraChatRunRepository.save({
                ...successRun,
                usageRecorded: true,
            })
        }

        if (telegramId) {
            await this.notificationService.notify(
                telegramId,
                `Sora generation completed.\nStatus: success\nResult: ${successRun.outputUrl}`,
            )
        }
    }

    private async markSoraRunError(run: SoraChatRun, errorMessage: string, telegramId?: number) {
        const updated = await this.soraChatRunRepository.save({
            ...run,
            status: ChatRunStatusEnum.ERROR,
            errorMessage,
            finishedAt: run.finishedAt || new Date(),
        })

        if (telegramId) {
            await this.notificationService.notify(
                telegramId,
                `Sora generation completed.\nStatus: error\nError: ${updated.errorMessage}`,
            )
        }
    }

    private mapVideoStatus(status: OpenAiVideoStatus) {
        switch (status) {
            case 'completed':
                return ChatRunStatusEnum.SUCCESS
            case 'failed':
                return ChatRunStatusEnum.ERROR
            case 'queued':
            case 'in_progress':
            default:
                return ChatRunStatusEnum.RUNNING
        }
    }

    private estimateTokens(text: string) {
        return Math.max(1, Math.ceil((text || '').length / 4))
    }

    private ensureOpenAiEnabled() {
        if (!this.openai) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'OpenAI API key is not configured')
        }
    }

    private extractErrorMessage(error: unknown) {
        if (!error) {
            return 'Unexpected error'
        }
        if (error instanceof Error) {
            return error.message
        }
        if (typeof error === 'string') {
            return error
        }
        return JSON.stringify(error)
    }

    private normalizeProviderError(error: unknown, fallback: string) {
        const status = (error as any)?.status
        const raw = this.extractErrorMessage(error)
        const normalized = raw.toLowerCase()

        if (status === 401 || normalized.includes('invalid_api_key') || normalized.includes('incorrect api key')) {
            return 'OpenAI authentication failed. Check OPENAI_API_KEY.'
        }

        if (
            status === 429 ||
            normalized.includes('quota') ||
            normalized.includes('insufficient_quota') ||
            normalized.includes('rate limit')
        ) {
            return 'OpenAI quota/rate limit exceeded. Check billing and usage limits.'
        }

        if (status >= 500 || normalized.includes('timeout') || normalized.includes('temporarily unavailable')) {
            return 'OpenAI service is temporarily unavailable. Try again later.'
        }

        return raw || fallback
    }
}
