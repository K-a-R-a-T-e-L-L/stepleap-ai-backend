import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'
import { AutomationTemplateStepDto } from './automation-template-step.dto'

export class CreateAutomationTemplateDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    n8nId: string

    @ApiPropertyOptional({ type: 'object', additionalProperties: true })
    @IsObject()
    @IsOptional()
    params?: Record<string, any>

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsOptional()
    requiredMeters?: string[]

    @ApiPropertyOptional({ type: 'object', additionalProperties: true })
    @IsObject()
    @IsOptional()
    maxUnitsPerRun?: Record<string, number>

    @ApiPropertyOptional({ type: [AutomationTemplateStepDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AutomationTemplateStepDto)
    @IsOptional()
    steps?: AutomationTemplateStepDto[]
}
