import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'

import { Meter } from './entities/meter.entity'
import { PlanLimit } from './entities/plan-limit.entity'
import { UsageEvent } from './entities/usage-event.entity'
import { UsageLineItem } from './entities/usage-line-item.entity'

@Injectable()
export class BillingAdminService {
    constructor(
        @InjectRepository(Meter) private readonly meterRepository: Repository<Meter>,
        @InjectRepository(PlanLimit) private readonly planLimitRepository: Repository<PlanLimit>,
        @InjectRepository(UsageEvent) private readonly usageEventRepository: Repository<UsageEvent>,
        @InjectRepository(UsageLineItem) private readonly usageLineItemRepository: Repository<UsageLineItem>,
    ) {}

    listMeters() {
        return this.meterRepository.find({ order: { createdAt: 'DESC' } })
    }

    createMeter(dto: Partial<Meter>) {
        const entity = this.meterRepository.create(dto)
        return this.meterRepository.save(entity)
    }

    async removeMeter(id: string) {
        const entity = await this.meterRepository.findOne({ where: { id } })
        if (!entity) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND)
        }
        await this.meterRepository.softDelete(id)
        return this.meterRepository.findOne({ where: { id }, withDeleted: true })
    }

    listPlanLimits(planId?: string) {
        return this.planLimitRepository.find({
            where: planId ? { planId } : undefined,
            order: { createdAt: 'DESC' },
        })
    }

    createPlanLimit(dto: Partial<PlanLimit>) {
        const entity = this.planLimitRepository.create(dto)
        return this.planLimitRepository.save(entity)
    }

    async removePlanLimit(id: string) {
        const entity = await this.planLimitRepository.findOne({ where: { id } })
        if (!entity) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND)
        }
        await this.planLimitRepository.softDelete(id)
        return this.planLimitRepository.findOne({ where: { id }, withDeleted: true })
    }

    listUsageEvents(runLogId?: string) {
        return this.usageEventRepository.find({
            where: runLogId ? { runLogId } : undefined,
            order: { createdAt: 'DESC' },
        })
    }

    listUsageLineItems(usageEventId?: string) {
        return this.usageLineItemRepository.find({
            where: usageEventId ? { usageEventId } : undefined,
            order: { createdAt: 'DESC' },
        })
    }
}
