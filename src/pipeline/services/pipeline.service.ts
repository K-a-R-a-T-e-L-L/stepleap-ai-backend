import { Injectable } from '@nestjs/common'
import { GeminiService } from '../../ai/ai-providers/gemini/gemini.service'
import { CaptionsService } from 'src/captions/services/captions.service'
import { SoraService } from 'src/sora/services/sora.service'
import { SoraModels, Seconds, Size } from 'src/sora/dto/create-sora-video.dto'
import { CreateStepDto } from '../dto/create-step.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Pipeline } from '../entities/pipeline.entity'
import { Repository } from 'typeorm'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { PipelineStep } from '../entities/pipeline-step.entity'
import { PipelineStepType } from '../enums/pipeline-step-type.enum'
import { AiTextProvider } from 'src/ai/interfaces/ai-text-provider.interface'
import { AiProviderEnum } from '../enums/ai-provider.enum'
import { ChatGPTService } from 'src/ai/ai-providers/chatgpt/chatgpt.service'
import { AiVideoProvider } from 'src/ai/interfaces/ai-video-provider.interface'
import { User } from 'src/system/user/entity/user.entity'
import { PipelineStepStatusEnum } from '../enums/pipeline-step-status.enum'
import { pipe } from 'rxjs'

@Injectable()
export class PipelineService {
    constructor(
        private readonly realChatGPTService: ChatGPTService,
        private readonly geminiService: GeminiService,
        private readonly captionsService: CaptionsService,
        private readonly soraService: SoraService,
        @InjectRepository(Pipeline) private readonly pipelineRepository: Repository<Pipeline>,
    ) {}

    async addStepToPipeline({
        stepDto,
        pipelineId,
    }: {
        stepDto: CreateStepDto
        pipelineId: string
    }): Promise<PipelineStep> {
        const pipeline = await this.pipelineRepository.findOneBy({ id: pipelineId })

        if (!pipeline) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND, 'Pipeline not found')
        }

        console.log(stepDto)

        const newStep = new PipelineStep()
        newStep.pipeline = pipeline

        newStep.type = stepDto.type
        newStep.provider = stepDto.provider
        newStep.config = stepDto.config
        newStep.input = stepDto.input

        return newStep.save()
    }

    async executePipeline({ pipelineId }: { pipelineId: string }): Promise<Pipeline> {
        const pipeline = await this.pipelineRepository.findOneBy({ id: pipelineId })
        pipeline.steps.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

        if (!pipeline) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND, 'Pipeline not found')
        }

        for (let i = 0; i < pipeline.steps.length; i++) {
            let pipelineStep = pipeline.steps[i]

            if (pipelineStep.status === PipelineStepStatusEnum.COMPLETED && pipelineStep.error === '') continue

            if (i > 0) pipelineStep.input = pipeline.steps[i - 1].output

            if (pipelineStep.type === PipelineStepType.TEXT) {
                let pipelineAiProvider: AiTextProvider

                switch (pipelineStep.provider) {
                    case AiProviderEnum.CHATGPT:
                        pipelineAiProvider = this.realChatGPTService
                        break
                    case AiProviderEnum.GEMINI:
                        pipelineAiProvider = this.geminiService
                        break
                    default:
                        throw new ErrorDto(
                            ErrorCodeEnum.ENTITY_NOT_FOUND,
                            `Couldn't find text provider ${pipelineStep.provider}`,
                        )
                }

                pipelineStep.output = await pipelineAiProvider.generateText(pipelineStep.input, pipelineStep.config)
            } else if (pipelineStep.type === PipelineStepType.VIDEO) {
                let pipelineAiProvider: AiVideoProvider

                console.log(pipelineStep)

                switch (pipelineStep.provider) {
                    case AiProviderEnum.CHATGPT:
                        pipelineAiProvider = this.realChatGPTService
                        break
                    case AiProviderEnum.GEMINI:
                        pipelineAiProvider = this.geminiService
                        break
                    default:
                        throw new ErrorDto(
                            ErrorCodeEnum.ENTITY_NOT_FOUND,
                            `Couldn't find video provider ${pipelineStep.provider}`,
                        )
                }

                try {
                    pipelineStep.output = await pipelineAiProvider.generateVideo(
                        pipelineStep.input,
                        pipelineStep.config,
                    )
                } catch (e: any) {
                    pipelineStep.error = e.message
                    break
                }
            }

            pipelineStep.status = PipelineStepStatusEnum.COMPLETED
            await pipelineStep.save()
        }

        return pipeline.save()
    }

    async createPipeline(user: User) {
        const newPipeline = this.pipelineRepository.create({
            user: user,
            steps: [
                {
                    type: PipelineStepType.TEXT,
                    provider: AiProviderEnum.GEMINI,
                    input: 'Generate a prompt for a 4 second flower shop promotional video',
                    config: {},
                },
            ],
        })

        return newPipeline.save()
    }

    async getUserPipelines(user: User) {
        return await this.pipelineRepository.find({
            where: {
                user: {
                    id: user.id,
                },
            },
            order: {
                createdAt: 'DESC',
                steps: {
                    createdAt: 'DESC',
                },
            },
        })
    }

    async pipelineBelongsToUser(pipelineId: string, user: User) {
        const pipeline = this.pipelineRepository.findOneBy({
            id: pipelineId,
            user: {
                id: user.id,
            },
        })

        return !!pipeline
    }

    // async createPipeline({ prompt, textModel, videoModel }: { textModel: string; prompt: string; videoModel: string }) {
    //     let textPrompt
    //     switch (textModel) {
    //         case 'gemini':
    //             textPrompt = await this.geminiService.generate(prompt)
    //             break
    //         case 'chatgpt':
    //             textPrompt = (await this.chatgptService.create('gpt-5-mini', prompt)).output_text
    //             break
    //     }

    //     let videoFile
    //     switch (videoModel) {
    //         case 'veo':
    //             videoFile = await this.geminiService.generateVideo(`Make a 9:16 aspect ratio video. ${textPrompt}`)
    //             console.log(`Gemini response:`)
    //             console.log(videoFile)
    //             break
    //         case 'sora':
    //             let soraResponse = await this.soraService.createVideo({
    //                 model: SoraModels.SORA2,
    //                 prompt: textPrompt,
    //                 seconds: Seconds.FOUR,
    //                 size: Size.SIZE_720x1280,
    //             })

    //             while (soraResponse.status !== 'completed') {
    //                 await new Promise((resolve) => setTimeout(resolve, 10000))
    //                 soraResponse = await this.soraService.checkVideoStatus(soraResponse.id)
    //             }

    //             videoFile = await this.soraService.downloadVideo(soraResponse.id)
    //     }

    //     const captionedVideo = await this.captionsService.addCaptionToVideo({
    //         videoUrl: videoFile.originalUrl,
    //     })

    //     console.log(`Captioned video:`)
    //     console.log(captionedVideo)
    //     return captionedVideo
    // }
}
