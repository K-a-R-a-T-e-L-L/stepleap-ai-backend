import { ApiProperty } from '@nestjs/swagger'
import { CareerProfileDto } from './career-profile.dto'

export class CareerProfileStateDto {
    @ApiProperty({ example: '1001' })
    profileKey: string

    @ApiProperty({ type: CareerProfileDto })
    profile: CareerProfileDto

    @ApiProperty({ example: '2026-04-04T12:00:00.000Z' })
    updatedAt: string
}
