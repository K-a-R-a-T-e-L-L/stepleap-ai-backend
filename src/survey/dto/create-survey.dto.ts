import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class CreateSurveyDto {
    @Validate(TypeValidate.STRING)
    firstName: string

    @Validate(TypeValidate.STRING)
    lastName: string

    @Validate(TypeValidate.UUID)
    imageId: string

    @Validate(TypeValidate.STRING)
    dob: string

    @Validate(TypeValidate.STRING)
    phone: string

    @Validate(TypeValidate.STRING)
    source: string

    @Validate(TypeValidate.STRING)
    goal: string

    @Validate(TypeValidate.BOOLEAN)
    isShowInMembersList: boolean
}