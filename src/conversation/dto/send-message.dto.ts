import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class SendMessageDto {
    @Validate(TypeValidate.STRING)
    input: string
}
