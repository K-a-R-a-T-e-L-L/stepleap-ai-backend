import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

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
}
