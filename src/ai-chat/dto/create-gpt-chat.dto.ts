import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator'

export class CreateGptChatDto {
    @ApiProperty({ example: 'Write 5 short ideas for a promo video about a coffee shop.' })
    @IsString()
    @MaxLength(8000)
    prompt: string

    @ApiPropertyOptional({ format: 'uuid' })
    @IsOptional()
    @IsUUID()
    chatDialogId?: string

    @ApiPropertyOptional({ example: 'gpt-4o-mini' })
    @IsOptional()
    @IsString()
    model?: string

    @ApiPropertyOptional({ example: 0.7, minimum: 0, maximum: 2 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(2)
    temperature?: number

    @ApiPropertyOptional({ example: 800, minimum: 1, maximum: 4000 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(4000)
    maxCompletionTokens?: number
}
