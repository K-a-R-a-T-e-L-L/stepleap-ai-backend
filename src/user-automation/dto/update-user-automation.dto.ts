import { PartialType } from '@nestjs/swagger';
import { CreateUserAutomationDto } from './create-user-automation.dto';

export class UpdateUserAutomationDto extends PartialType(CreateUserAutomationDto) {}
