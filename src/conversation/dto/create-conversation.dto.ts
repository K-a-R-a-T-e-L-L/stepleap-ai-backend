import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class CreateConversationDto {
    @Validate(TypeValidate.STRING)
    model: string
}
