import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class CreatePipelineDto {
    @Validate(TypeValidate.STRING, { required: false })
    name?: string
}
