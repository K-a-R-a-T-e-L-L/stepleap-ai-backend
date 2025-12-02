import { TypeValidate, Validate } from '@common/decorators/validation.helpers'
import { IsOptional } from 'class-validator'

export class SendMessageDto {
    @Validate(TypeValidate.STRING)
    input?: string

    @Validate(TypeValidate.ARRAY, { nullable: true })
    @IsOptional()
    files?: string[]

    @Validate(TypeValidate.STRING)
    model: string
}
