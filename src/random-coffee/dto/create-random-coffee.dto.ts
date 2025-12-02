import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class CreateRandomCoffeeDto {
    @Validate(TypeValidate.ARRAY)
    userIds: string[]
}