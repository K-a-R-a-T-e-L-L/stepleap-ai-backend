import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class UpdateGroupDto {
    @Validate(TypeValidate.ARRAY)
    userIds: string[]
}