import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { GroupService } from '../services/group.service'

@Controller('group')
@ApiTags('Groups')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}
}