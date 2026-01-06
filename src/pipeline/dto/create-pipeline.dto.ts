import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class CreatePipelineDto {
    @Validate(TypeValidate.STRING)
    prompt: string

    @Validate(TypeValidate.STRING)
    textModel: string

    @Validate(TypeValidate.STRING)
    videoModel: string
}
