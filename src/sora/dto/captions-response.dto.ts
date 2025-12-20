import { TypeValidate, Validate, ValidateEnum } from '@common/decorators/validation.helpers'
import { ApiProperty } from '@dataui/crud/lib/crud'

enum statusEnum {
    PROCESSING = 'PROCESSING',
    COMPLETE = 'COMPLETE',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

export class CaptionsResponseDto {
    @ValidateEnum(TypeValidate.ENUM, { enum: statusEnum })
    status: statusEnum

    @Validate(TypeValidate.STRING)
    id: string

    @Validate(TypeValidate.STRING)
    video_id: string

    @Validate(TypeValidate.NUMBER)
    created_at: number

    @Validate(TypeValidate.STRING)
    model: string

    @Validate(TypeValidate.STRING, { required: false })
    object?: 'video'

    @Validate(TypeValidate.NUMBER, { required: false })
    progress?: number

    @Validate(TypeValidate.NUMBER, { required: false })
    completed_at?: number

    @ApiProperty({
        type: 'object',
        properties: {
            code: {
                type: 'string',
            },
            message: {
                type: 'string',
            },
        },
        required: ['code', 'message'],
    })
    error?: {
        code: string
        message: string
    }
}
