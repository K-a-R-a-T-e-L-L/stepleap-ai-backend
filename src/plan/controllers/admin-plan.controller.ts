import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { UserAuth, UserAuthType } from '@common/decorators/auth.helpers'
import { PlanService } from '../services/plan.service'
import { CreatePlanDto } from '../dto/create-plan.dto'

@ApiTags('Admin plans')
@Controller('admin/plans')
export class AdminPlanController {
    constructor(private readonly planService: PlanService) {}

    @Post()
    @UserAuth(UserAuthType.ADMIN)
    @ApiOperation({ summary: 'Create plan' })
    async post(@Body() createPlanDto: CreatePlanDto) {
        return this.planService.save(createPlanDto)
    }
}
