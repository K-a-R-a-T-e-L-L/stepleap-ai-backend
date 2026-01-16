import { CreateStepDto } from './create-step.dto'
import { PartialType } from '@nestjs/swagger'

export class UpdateStepDto extends PartialType(CreateStepDto) {}
