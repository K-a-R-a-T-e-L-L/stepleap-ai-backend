import { CreateStepDto } from './create-step.dto'
import { PartialType } from '@nestjs/mapped-types'

export class UpdateStepDto extends PartialType(CreateStepDto) {}
