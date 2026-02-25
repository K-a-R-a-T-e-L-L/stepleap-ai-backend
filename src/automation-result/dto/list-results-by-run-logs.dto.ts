import { ApiProperty } from '@nestjs/swagger'
import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsUUID } from 'class-validator'

export class ListResultsByRunLogsDto {
    @ApiProperty({ type: [String], example: ['run-log-id-1', 'run-log-id-2'] })
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMaxSize(100)
    @IsUUID('4', { each: true })
    runLogIds: string[]
}
