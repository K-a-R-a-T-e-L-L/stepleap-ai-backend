import { TypeValidate, Validate, ValidateEnum } from '@common/decorators/validation.helpers'

enum SoraModels {
    SORA2 = 'sora-2',
    SORA2PRO = 'sora-2-pro',
}

enum Seconds {
    FOUR = '4',
    EIGHT = '8',
    TWELVE = '12',
}

enum Size {
    SIZE_720x1280 = '720x1280',
    SIZE_1280x720 = '1280x720',
    SIZE_1024x1792 = '1024x1792',
    SIZE_1792x1024 = '1792x1024',
}

export class CreateVideoDto {
    @Validate(TypeValidate.STRING)
    prompt: string

    // @Validate(TypeValidate.STRING, { required: false })
    // input_reference: string

    @ValidateEnum({ enum: SoraModels, required: false, default: 'sora-2' })
    model: SoraModels

    @ValidateEnum({ enum: Seconds, required: false, default: '4' })
    seconds: Seconds

    @ValidateEnum({ enum: Size, required: false, default: '720x1280' })
    size: Size
}
