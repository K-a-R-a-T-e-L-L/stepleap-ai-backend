import { TypeValidate, Validate } from '@common/decorators/validation.helpers'

export class UpdatePipelineDto {
    @Validate(TypeValidate.STRING)
    name: string
}
