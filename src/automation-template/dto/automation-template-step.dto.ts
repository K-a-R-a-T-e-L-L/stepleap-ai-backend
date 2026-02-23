import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator'

export class AutomationTemplateStepDto {
    @ApiProperty({ example: 'gpt_prompt_done' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    @Matches(/^[a-z0-9_:-]+$/)
    code: string

    @ApiProperty({ example: 'GPT prepared prompt' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(128)
    title: string

    @ApiPropertyOptional({ example: 'GPT подготовил промпт' })
    @IsString()
    @IsOptional()
    @MaxLength(128)
    titleRu?: string

    @ApiPropertyOptional({ example: 'GPT prepared prompt' })
    @IsString()
    @IsOptional()
    @MaxLength(128)
    titleEn?: string

    @ApiPropertyOptional({ example: 'Collect prompt tokens and generated text' })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string

    @ApiPropertyOptional({ example: 10, minimum: 0, maximum: 1000 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(1000)
    @IsOptional()
    sortOrder?: number
}
