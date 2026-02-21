import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

export const soraDurationVariants = [4, 8, 12] as const
export const soraSizeVariants = ['720x1280', '1280x720', '1024x1792', '1792x1024'] as const
export const soraModelVariants = ['sora-2', 'sora-2-pro'] as const

export class CreateSoraChatDto {
    @ApiProperty({ example: 'A futuristic city timelapse at sunrise, cinematic lighting' })
    @IsString()
    @MaxLength(8000)
    prompt: string

    @ApiProperty({ enum: soraDurationVariants })
    @IsIn(soraDurationVariants)
    seconds: (typeof soraDurationVariants)[number]

    @ApiProperty({ enum: soraSizeVariants })
    @IsIn(soraSizeVariants)
    size: (typeof soraSizeVariants)[number]

    @ApiPropertyOptional({ enum: soraModelVariants })
    @IsOptional()
    @IsIn(soraModelVariants)
    model?: (typeof soraModelVariants)[number]
}
