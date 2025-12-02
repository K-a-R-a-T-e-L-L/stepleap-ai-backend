import { Module } from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Subscription} from "./entity/subscription.entity";
import { SubscriptionService } from './services/subscription.service'
import { PaymentModule } from '../payment/payment.module'
import { ChatModule } from '../chat/chat.module'
import { SubscriptionUserController } from './controllers/subscription.user.controller'
import { JwtModule } from '@nestjs/jwt'
import { SubscriptionController } from './controllers/subscription.controller'

@Module({
    imports: [TypeOrmModule.forFeature([Subscription]), PaymentModule, ChatModule, JwtModule],
    controllers: [SubscriptionUserController, SubscriptionController],
    providers: [SubscriptionService],
    exports: [SubscriptionService]
})
export class SubscriptionModule {}
