import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PlanService } from '../services/plan.service'
import { PlansPaginated } from '@common/pagination/paginated.configs'
import { UserDockGetMany } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { Plan } from '../entity/plan.entity'
import { Paginate, PaginateQuery } from 'nestjs-paginate'

@Controller('plans')
@ApiTags('Plans')
export class PlanController {
    constructor(private readonly planService: PlanService) {}

    @UserDockGetMany('', UserAuthType.NOT_AUTH, Plan, PlansPaginated, 'Получить список тарифов')
    async get(@Paginate() query: PaginateQuery) {
        return this.planService.findAll(query, PlansPaginated);
    }

}
