import { PartialType } from '@nestjs/swagger';
import { CreateAutomationTemplateDto } from './create-automation-template.dto';

export class UpdateAutomationTemplateDto extends PartialType(CreateAutomationTemplateDto) {}
