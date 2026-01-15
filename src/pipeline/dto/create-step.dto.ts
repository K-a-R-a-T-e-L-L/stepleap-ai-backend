import { TypeValidate, Validate, ValidateEnum } from '@common/decorators/validation.helpers'
import { AiProviderEnum } from '../enums/ai-provider.enum'
import { PipelineStepType } from '../enums/pipeline-step-type.enum'
import { PipelineStepInput } from '../entities/pipeline-step.entity'
import { ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class CreateStepDto {
    @ValidateNested({ each: true })
    @Type(() => PipelineStepInput)
    @Validate(TypeValidate.ARRAY)
    @ApiProperty({
        type: [PipelineStepInput],
    })
    @ValidateNested({ each: true })
    @Type(() => PipelineStepInput)
    input: PipelineStepInput[]

    @ValidateEnum(PipelineStepType, { enum: PipelineStepType })
    type: PipelineStepType

    @ValidateEnum(AiProviderEnum, { enum: AiProviderEnum })
    provider: AiProviderEnum

    @Validate(TypeValidate.OBJECT)
    config: any
}
