import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator'

import { RunStepStatusEnum } from '../../automation-run-log/enum/run-step-status.enum'

export class N8nProgressCallbackDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    runLogId: string

    @ApiProperty({ example: 'sora_started' })
    @IsString()
    @IsNotEmpty()
    stepCode: string

    @ApiProperty({ enum: RunStepStatusEnum })
    @IsEnum(RunStepStatusEnum)
    status: RunStepStatusEnum

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    message?: string

    @ApiPropertyOptional({ minimum: 0, maximum: 100 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(100)
    @IsOptional()
    progress?: number

    @ApiPropertyOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @IsOptional()
    seq?: number

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    idempotencyKey?: string

    @ApiPropertyOptional({ type: 'object', additionalProperties: true })
    @IsObject()
    @IsOptional()
    rawPayload?: Record<string, any>
}
