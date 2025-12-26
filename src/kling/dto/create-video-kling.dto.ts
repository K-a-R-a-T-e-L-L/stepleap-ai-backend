import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class CreateVideoKlingDto {
    @Validate(TypeValidate.STRING, { default: 'kling-v1' })
    modelName?: string

    @Validate(TypeValidate.STRING, { maxLength: 2500 })
    prompt: string
}
