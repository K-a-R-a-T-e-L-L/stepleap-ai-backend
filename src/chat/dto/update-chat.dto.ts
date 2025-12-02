import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class UpdateChatDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.NUMBER)
    tg_id: number
}