import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { BillingService } from './billing.service'
import { Meter } from './entities/meter.entity'
import { PlanLimit } from './entities/plan-limit.entity'
import { SubscriptionBalance } from './entities/subscription-balance.entity'
import { UsageEvent } from './entities/usage-event.entity'
import { UsageLineItem } from './entities/usage-line-item.entity'
import { Subscription } from '../subscription/entity/subscription.entity'
import { Plan } from '../plan/entity/plan.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Meter,
            PlanLimit,
            SubscriptionBalance,
            UsageEvent,
            UsageLineItem,
            Subscription,
            Plan,
        ]),
    ],
    providers: [BillingService],
    exports: [BillingService],
})
export class BillingModule {}
