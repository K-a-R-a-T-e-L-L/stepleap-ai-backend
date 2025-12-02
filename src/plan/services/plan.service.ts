import { Injectable } from '@nestjs/common'
import { BaseService } from '@common/database/base/base.service'
import { Plan } from '../entity/plan.entity'
import { CreatePlanDto } from '../dto/create-plan.dto'
import { UpdatePlanDto } from '../dto/update-plan.dto'
import { PaginateConfig, PaginateQuery } from 'nestjs-paginate'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class PlanService extends BaseService<Plan, CreatePlanDto, UpdatePlanDto> {
    constructor(
        @InjectRepository(Plan) private readonly planRepository: Repository<Plan>
    ) {
        super(planRepository);
    }
}