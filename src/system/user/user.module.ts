import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserController } from './controllers/user.controller'
import { User } from './entity/user.entity'
import { UserService } from './services/user.service'
import { UserAdminController } from './controllers/user.admin.controller'
import { SubscriptionModule } from '../../subscription/subscription.module'
import { PlanModule } from '../../plan/plan.module'
import { PaymentModule } from '../../payment/payment.module'
import { SurveyModule } from '../../survey/survey.module'

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([User]), JwtModule, SubscriptionModule, PlanModule, PaymentModule, SurveyModule],
    providers: [UserService, ConfigModule],
    controllers: [UserController, UserAdminController],
    exports: [UserService],
})
export class UserModule {}
