import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class UsageLineItemDto {
    @ApiProperty()
    @IsString()
    meterCode: string

    @ApiProperty()
    @IsInt()
    qty: number
}

export class N8nCallbackDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    runLogId: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    status: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    errorMessage?: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    outputUrl?: string

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    idempotencyKey?: string

    @ApiPropertyOptional({ type: 'object', additionalProperties: true })
    @IsObject()
    @IsOptional()
    rawPayload?: Record<string, any>

    @ApiPropertyOptional({ type: [UsageLineItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UsageLineItemDto)
    @IsOptional()
    usageLineItems?: UsageLineItemDto[]
}
