import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsNotEmpty, IsObject, IsOptional, IsUUID } from 'class-validator'
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

    @ApiProperty({ type: [String], required: false })
    @IsDateString({}, { each: true })
    @IsOptional()
    timeStart?: string[]

    @ApiProperty({ type: 'object', additionalProperties: true })
    @IsObject()
    @IsOptional()
    parameters?: Record<string, any>
}
