import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator'

import { ChatModelEnum } from '../enum/chat-model.enum'

export class CreateChatDialogDto {
    @ApiProperty({ enum: ChatModelEnum })
    @IsEnum(ChatModelEnum)
    model: ChatModelEnum

    @ApiPropertyOptional({ example: 'Work tasks' })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    title?: string
}
