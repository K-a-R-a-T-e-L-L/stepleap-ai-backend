import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class CreateVideoDto {
    @Validate(TypeValidate.STRING)
    imageReference: string

    @Validate(TypeValidate.STRING)
    audioReference: string
}
