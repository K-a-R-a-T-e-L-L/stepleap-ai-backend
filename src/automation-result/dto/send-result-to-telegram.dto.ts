import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class SendResultToTelegramDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    runLogId: string
}
