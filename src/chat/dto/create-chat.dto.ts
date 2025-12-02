import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class CreateChatDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.NUMBER)
    tg_id: number
}