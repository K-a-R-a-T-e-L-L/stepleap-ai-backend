import { TypeValidate, Validate, ValidateEnum } from '@common/decorators/validation.helpers'
import { AiProviderEnum } from '../enums/ai-provider.enum'
import { PipelineStepType } from '../enums/pipeline-step-type.enum'

export class CreateStepDto {
    @Validate(TypeValidate.STRING)
    input: string

    @ValidateEnum(PipelineStepType, { enum: PipelineStepType })
    type: PipelineStepType

    @ValidateEnum(AiProviderEnum, { enum: AiProviderEnum })
    provider: AiProviderEnum

    @Validate(TypeValidate.OBJECT)
    config: any
}
