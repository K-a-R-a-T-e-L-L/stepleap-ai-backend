import { ApiProperty } from '@nestjs/swagger'

export class CareerProofDto {
    @ApiProperty({ example: 'proof-1' })
    id: string

    @ApiProperty({ example: 'Мини-кейс по брифу' })
    title: string

    @ApiProperty({ example: 'draft' })
    status: string
}
