import { AiTextProvider } from 'src/ai/interfaces/ai-text-provider.interface'
import { PipelineStepType } from '../enums/pipeline-step-type.enum'
import { AiVideoProvider } from 'src/ai/interfaces/ai-video-provider.interface'
import { Column, Entity, ManyToOne } from 'typeorm'
import { Pipeline } from './pipeline.entity'
import { AiProviderEnum } from '../enums/ai-provider.enum'
import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger'
import { BaseEntity } from '@common/database/base/base.entity'
import { PipelineStepStatusEnum } from '../enums/pipeline-step-status.enum'
import { File } from 'src/file/entity/file.entity'
import { TypeValidate, Validate, ValidateEnum } from '@common/decorators/validation.helpers'
import { IsNotEmpty, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class PipelineStepInput {
    @ApiProperty({
        type: 'string',
        enum: ['TEXT', 'FILE'],
    })
    @ValidateEnum({ TEXT: 'TEXT', FILE: 'FILE' })
    type: 'TEXT' | 'FILE'

    @IsNotEmpty()
    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(File) }],
    })
    content: string | File
}

export interface PipelineStepOutput {
    type: 'TEXT' | 'FILE'
    content: string | File
}

@Entity()
export class PipelineStep extends BaseEntity {
    @ManyToOne(() => Pipeline, (pipeline) => pipeline.steps, {
        onDelete: 'CASCADE',
    })
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

    @ApiPropertyOptional({
        type: [PipelineStepInput],
    })
    @Column('jsonb', { default: [] })
    @ValidateNested({ each: true })
    @Type(() => PipelineStepInput)
    input?: PipelineStepInput[]

    @ApiPropertyOptional({
        type: [PipelineStepInput],
    })
    @Column('jsonb', { default: [] })
    @ValidateNested({ each: true })
    @Type(() => PipelineStepInput)
    output?: PipelineStepInput[]
}
