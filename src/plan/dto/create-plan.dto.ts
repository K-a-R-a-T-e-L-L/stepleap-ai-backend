import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class CreatePlanDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.NUMBER)
    period: number

    @Validate(TypeValidate.NUMBER)
    amount: number

    @Validate(TypeValidate.NUMBER)
    tokens: number

    @Validate(TypeValidate.BOOLEAN)
    isViewWebinars: boolean

    @Validate(TypeValidate.BOOLEAN)
    isViewAffiche: boolean

    @Validate(TypeValidate.BOOLEAN)
    isViewChats: boolean

    @Validate(TypeValidate.BOOLEAN)
    isRandomCoffee: boolean
}
