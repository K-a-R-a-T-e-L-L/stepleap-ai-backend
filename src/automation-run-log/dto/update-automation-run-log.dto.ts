import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsDateString, IsOptional } from 'class-validator'

import { CreateAutomationRunLogDto } from './create-automation-run-log.dto'

export class UpdateAutomationRunLogDto extends PartialType(CreateAutomationRunLogDto) {
    @ApiProperty({ required: false })
    @IsDateString()
    @IsOptional()
    endTime?: string
}
