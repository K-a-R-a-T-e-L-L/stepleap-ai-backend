import { AiTextProvider } from 'src/ai/interfaces/ai-text-provider.interface'
import { PipelineStepType } from '../enums/pipeline-step-type.enum'
import { AiVideoProvider } from 'src/ai/interfaces/ai-video-provider.interface'
import { Column, Entity, ManyToOne } from 'typeorm'
import { Pipeline } from './pipeline.entity'
import { AiProviderEnum } from '../enums/ai-provider.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { BaseEntity } from '@common/database/base/base.entity'
import { PipelineStepStatusEnum } from '../enums/pipeline-step-status.enum'

@Entity()
export class PipelineStep extends BaseEntity {
    @ManyToOne(() => Pipeline, (pipeline) => pipeline.steps)
    pipeline: Pipeline

    @ApiPropertyOptional({ default: '' })
    @Column({ default: '' })
    error?: string

    @ApiProperty({ enum: PipelineStepType })
    @Column()
    type: PipelineStepType

    @ApiProperty({ enum: PipelineStepStatusEnum, default: PipelineStepStatusEnum.WAITING })
    @Column({ default: PipelineStepStatusEnum.WAITING })
    status: PipelineStepStatusEnum

    @ApiPropertyOptional({ default: 0 })
    @Column({ default: 0 })
    progress?: number

    @ApiProperty({ enum: AiProviderEnum })
    @Column()
    provider: AiProviderEnum

    @ApiProperty()
    @Column('jsonb')
    config: any

    @ApiPropertyOptional()
    @Column('jsonb', { default: {} })
    input?: any

    @ApiPropertyOptional()
    @Column('jsonb', { default: {} })
    output?: any
}
