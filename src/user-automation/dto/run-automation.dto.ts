import { ApiProperty } from '@nestjs/swagger'
import { IsObject, IsOptional } from 'class-validator'

export class RunAutomationDto {
    @ApiProperty({ type: 'object', additionalProperties: true })
    @IsObject()
    @IsOptional()
    parameters?: Record<string, any>
}
