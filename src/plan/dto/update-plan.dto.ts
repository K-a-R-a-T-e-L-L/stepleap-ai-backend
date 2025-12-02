import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class UpdatePlanDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.NUMBER)
    period: number

    @Validate(TypeValidate.NUMBER)
    amount: number

    @Validate(TypeValidate.NUMBER)
    tokens: number

    @Validate(TypeValidate.BOOLEAN)
    is_view_webinars: boolean

    @Validate(TypeValidate.BOOLEAN)
    is_view_affiche: boolean

    @Validate(TypeValidate.BOOLEAN)
    is_view_chats: boolean

    @Validate(TypeValidate.BOOLEAN)
    is_random_coffee: boolean
}
