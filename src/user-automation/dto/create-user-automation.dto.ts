import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'
import { TriggerTypeEnum } from '../enum/trigger-type.enum'

export class CreateUserAutomationDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    templateId: string

    @ApiProperty({ enum: TriggerTypeEnum })
    @IsEnum(TriggerTypeEnum)
    @IsNotEmpty()
    triggerType: TriggerTypeEnum

    @ApiPropertyOptional({ maxLength: 120 })
    @IsString()
    @MaxLength(120)
    @IsOptional()
    name?: string

    @ApiPropertyOptional({ type: [String] })
    @IsDateString({}, { each: true })
    @IsOptional()
    timeStart?: string[]

    @ApiPropertyOptional({ type: 'object', additionalProperties: true })
    @IsObject()
    @IsOptional()
    parameters?: Record<string, any>

    @ApiPropertyOptional({ type: 'object', additionalProperties: true })
    @IsObject()
    @IsOptional()
    scheduleConfig?: Record<string, any>
}
