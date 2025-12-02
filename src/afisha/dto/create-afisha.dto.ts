import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class CreateAfishaDto {
    @Validate(TypeValidate.STRING)
    image: string

    @Validate(TypeValidate.STRING)
    description: string

    @Validate(TypeValidate.STRING)
    title: string

    @Validate(TypeValidate.STRING)
    dateAt: string

    @Validate(TypeValidate.STRING)
    place: string
}