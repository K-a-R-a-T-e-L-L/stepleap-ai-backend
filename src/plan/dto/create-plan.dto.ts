import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class CreatePlanDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.NUMBER)
    period: number

    @Validate(TypeValidate.NUMBER)
    amount: number
    // limits are defined in plan_limit
}
