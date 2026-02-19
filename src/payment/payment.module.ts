import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Payment } from './entity/payment.entity'
import { YookassaModule } from 'nestjs-yookassa'
import { PaymentController } from './controllers/payment.controller'
import { SubscriptionModule } from '../subscription/subscription.module'
import { SubscriptionService } from '../subscription/services/subscription.service'
import { Plan } from '../plan/entity/plan.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Payment, Plan]), YookassaModule, forwardRef(() => SubscriptionModule)],
    providers: [PaymentService],
    controllers: [PaymentController],
    exports: [PaymentService]
})
export class PaymentModule {}
