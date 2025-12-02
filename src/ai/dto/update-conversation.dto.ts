import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class UpdateConversationDto {
    @Validate(TypeValidate.STRING)
    model: string

    @Validate(TypeValidate.STRING)
    prompt: string
}