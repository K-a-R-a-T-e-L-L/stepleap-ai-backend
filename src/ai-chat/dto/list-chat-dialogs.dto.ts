import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

import { ChatModelEnum } from '../enum/chat-model.enum'

export class ListChatDialogsDto {
    @ApiPropertyOptional({ enum: ChatModelEnum })
    @IsOptional()
    @IsEnum(ChatModelEnum)
    model?: ChatModelEnum
}
