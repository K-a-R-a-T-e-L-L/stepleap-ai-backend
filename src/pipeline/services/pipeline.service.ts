import { Injectable } from '@nestjs/common'
import { CreateStepDto } from '../dto/create-step.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Pipeline } from '../entities/pipeline.entity'
import { Repository } from 'typeorm'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { PipelineStep, PipelineStepInput } from '../entities/pipeline-step.entity'
import { User } from 'src/system/user/entity/user.entity'
import { PipelineStepStatusEnum } from '../enums/pipeline-step-status.enum'
import { AiProvidersService } from 'src/ai/ai-providers/ai-providers.service'
import { CreatePipelineDto } from '../dto/create-pipeline.dto'
import { UpdatePipelineDto } from '../dto/update-pipeline.dto'
import { UpdateStepDto } from '../dto/update-step.dto'

@Injectable()
export class PipelineService {
    constructor(
        private readonly aiProvidersService: AiProvidersService,
        @InjectRepository(Pipeline) private readonly pipelineRepository: Repository<Pipeline>,
        @InjectRepository(PipelineStep) private readonly pipelineStepRepository: Repository<PipelineStep>,
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
            const pipelineStep = pipeline.steps[i]

            if (pipelineStep.status === PipelineStepStatusEnum.COMPLETED && pipelineStep.error === '') continue

            if (i > 0) {
                pipelineStep.input = pipelineStep.input.concat(pipeline.steps[i - 1].output)
            }

            try {
                const aiProvider = this.aiProvidersService.getAiProvider(pipelineStep.provider)
                pipelineStep.output = (await aiProvider.generateOutput(
                    pipelineStep.input,
                    pipelineStep.config,
                )) as PipelineStepInput[]

                pipelineStep.status = PipelineStepStatusEnum.COMPLETED
                pipelineStep.error = ''
            } catch (error) {
                console.error(error)
                pipelineStep.error = error.message
                break
            }

            await pipelineStep.save()
        }

        return pipeline.save()
    }

    async createPipeline(user: User, createPipelineDto: CreatePipelineDto) {
        const newPipeline = this.pipelineRepository.create({
            user: user,
            steps: [],
            ...createPipelineDto,
        })

        return newPipeline.save()
    }

    async deletePipeline(pipelineId: string) {
        return this.pipelineRepository.delete(pipelineId)
    }

    async updatePipeline(pipelineId: string, updatePipelineDto: UpdatePipelineDto) {
        return this.pipelineRepository.save({
            id: pipelineId,
            ...updatePipelineDto,
        })
    }

    async updatePipelineStep(pipelineId: string, stepId: string, updatePipelineStepDto: UpdateStepDto) {
        return this.pipelineStepRepository.save({
            id: stepId,
            ...updatePipelineStepDto,
        })
    }

    async deletePipelineStep(pipelineId: string, stepId: string) {
        return this.pipelineStepRepository.delete(stepId)
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
}
