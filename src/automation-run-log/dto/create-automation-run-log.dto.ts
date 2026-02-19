import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { RunLogStatusEnum } from '../enum/run-log-status.enum'

export class CreateAutomationRunLogDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    userAutomationId: string

    @ApiProperty({ enum: RunLogStatusEnum })
    @IsEnum(RunLogStatusEnum)
    @IsNotEmpty()
    status: RunLogStatusEnum

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    errorMessage?: string

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    n8nExecutionId?: string
}
