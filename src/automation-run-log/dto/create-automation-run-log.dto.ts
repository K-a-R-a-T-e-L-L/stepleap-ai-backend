import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateAutomationRunLogDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    userAutomationId: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    status: string

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    errorMessage?: string

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    n8nExecutionId?: string
}
