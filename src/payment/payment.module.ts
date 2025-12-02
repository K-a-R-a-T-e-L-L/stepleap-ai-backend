import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Payment } from './entity/payment.entity'
import { YookassaModule } from 'nestjs-yookassa'
import { PaymentController } from './controllers/payment.controller'
import { SubscriptionModule } from '../subscription/subscription.module'
import { SubscriptionService } from '../subscription/services/subscription.service'
import { ChatModule } from '../chat/chat.module'

@Module({
    imports: [TypeOrmModule.forFeature([Payment]), YookassaModule, forwardRef(() => SubscriptionModule), ChatModule],
    providers: [PaymentService],
    controllers: [PaymentController],
    exports: [PaymentService]
})
export class PaymentModule {}
