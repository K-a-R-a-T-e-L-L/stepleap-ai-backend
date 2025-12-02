import { Body, Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserDockGetOne, UserDockPost } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { CreateSubscriptionDto } from '../dto/create-subscription.dto'
import { Subscription } from '../entity/subscription.entity'
import { SubscriptionService } from '../services/subscription.service'
import { UserService } from '../../system/user/services/user.service'
import { UserDecorator } from '../../system/user/decorators/user.decorator'
import { User } from '../../system/user/entity/user.entity'
import { PaymentService } from '../../payment/services/payment.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ActionDto } from '../dto/action.dto'

@Controller('user/subscription')
@ApiTags('Subscriptions')
export class SubscriptionUserController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly userService: UserService,
        private readonly paymentService: PaymentService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    @UserDockGetOne('', UserAuthType.USER, Subscription, 'Получить подписку пользователя')
    async getUserSubscription(@UserDecorator() user: User) {
        return this.subscriptionService.getOne({
            where: {
                userId: user.id,
            },
        })
    }

    @UserDockPost('', UserAuthType.USER, CreateSubscriptionDto, Subscription, 'Создать подписку')
    async createUserSubscription(@UserDecorator() user: User, @Body() createSubscriptionDto: CreateSubscriptionDto) {
        return this.subscriptionService.create(user, createSubscriptionDto.planId)
    }

    @UserDockPost('action', UserAuthType.USER, ActionDto, null, 'Выполнить действие с подпиской пользователя')
    async subscriptionAction(@UserDecorator() user: User, @Body() actionDto: ActionDto) {
        return this.subscriptionService.performAction(user, actionDto.action)
    }
}
