import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class UpdatePaymentDto {
    @Validate(TypeValidate.NUMBER)
    amount: number

    @Validate(TypeValidate.UUID)
    userId: string

    @Validate(TypeValidate.STRING)
    status: string

    @Validate(TypeValidate.STRING)
    paymentPayId: string

    @Validate(TypeValidate.STRING)
    paymentLink: string

    @Validate(TypeValidate.UUID)
    subscriptionId: string
}
