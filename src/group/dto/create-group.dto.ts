import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class CreateGroupDto {
    @Validate(TypeValidate.ARRAY)
    userIds: string[]
}