import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateUserAutomationDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    templateId: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    triggerType: string

    @ApiProperty({ type: [String], required: false })
    @IsDateString({}, { each: true })
    @IsOptional()
    timeStart?: string[]

    @ApiProperty({ type: 'object', additionalProperties: true })
    @IsObject()
    @IsOptional()
    parameters?: Record<string, any>
}
