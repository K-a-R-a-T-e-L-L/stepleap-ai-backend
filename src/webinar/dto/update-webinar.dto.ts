import { TypeValidate, Validate } from '@common/decorators/validation.helpers'
import { ApiProperty } from '@nestjs/swagger'
import { Column } from 'typeorm'

export class UpdateWebinarDto {
    @Validate(TypeValidate.STRING)
    previewFileId: string

    @Validate(TypeValidate.STRING)
    contentFileId: string

    @Validate(TypeValidate.STRING)
    title: string

    @Validate(TypeValidate.STRING)
    preview: string

    @Validate(TypeValidate.STRING)
    content: string

    @Validate(TypeValidate.DATE)
    dateAt: string

    @Validate(TypeValidate.STRING)
    place: string
}