import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class UpdateRandomCoffeeDto {
    @Validate(TypeValidate.ARRAY)
    userIds: string[]
}