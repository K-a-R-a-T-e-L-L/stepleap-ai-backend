import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class GenerateVideoDto {
    @Validate(TypeValidate.STRING)
    prompt: string
}
