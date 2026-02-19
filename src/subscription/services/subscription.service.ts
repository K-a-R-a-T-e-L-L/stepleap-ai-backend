import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { BaseService } from '@common/database/base/base.service'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, LessThanOrEqual, Not, Repository } from 'typeorm'
import { Subscription } from '../entity/subscription.entity'
import { CreateSubscriptionDto } from '../dto/create-subscription.dto'
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto'
import { StatusesEnum } from '../enum/statuses.enum'
import { PaymentService } from '../../payment/services/payment.service'
import { Cron, CronExpression } from '@nestjs/schedule'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { User } from '../../system/user/entity/user.entity'
import { ActionsEnum } from '../enum/actions.enum'
import { NotificationService } from '../../notification/notification.service'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'

@Injectable()
export class SubscriptionService extends BaseService<Subscription, CreateSubscriptionDto, UpdateSubscriptionDto> {
    constructor(
        @InjectRepository(Subscription) private readonly subscriptionRepository: Repository<Subscription>,
        @Inject(forwardRef(() => PaymentService)) private readonly paymentService: PaymentService,
        private readonly eventEmitter: EventEmitter2,
        private readonly notificationService: NotificationService,
    ) {
        super(subscriptionRepository)
    }

    async stopSubscription(userId: string) {
        const userSubscription = await this.getOne({ where: { userId }, relations: { user: true } })
        userSubscription.status = StatusesEnum.STOPPED
        userSubscription.yookassaPaymentId = ''
        await userSubscription.save()
        this.eventEmitter.emit('subscription.stop', {
            subscription: userSubscription,
        })

        return userSubscription
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async renewSubscriptions() {
        const subscriptions = await this.subscriptionRepository.find({
            where: {
                status: StatusesEnum.ACTIVE,
                nextPayAt: LessThanOrEqual(new Date()),
                yookassaPaymentId: Not(IsNull()),
            },
            relations: {
                plan: true,
            },
        })

        for (let subscription of subscriptions) {
            const paymentResult = await this.paymentService.createPayment(subscription)
            subscription.nextPayAt.setDate(subscription.nextPayAt.getDate() + subscription.plan.period)
            subscription.save()
        }
    }

    async renewSubscription(subscriptionId: string, yooKassaPaymentId?: string) {
        const subscription = await this.getOne({
            where: {
                id: subscriptionId,
            },
            relations: {
                user: true,
            },
        })

        subscription.status = StatusesEnum.ACTIVE
        subscription.yookassaPaymentId = yooKassaPaymentId ?? subscription.yookassaPaymentId

        if (!subscription.startAt) {
            subscription.startAt = new Date()
            subscription.nextPayAt = new Date()
            subscription.nextPayAt.setDate(subscription.startAt.getDate() + subscription.plan.period)
        } else {
            subscription.nextPayAt.setDate(subscription.nextPayAt.getDate() + subscription.plan.period)
        }

        return subscription.save()
    }

    async performAction(user: User, action: ActionsEnum) {
        if (action === ActionsEnum.PAYMENT_CREATE) {
            const subscription = await this.subscriptionRepository.findOneBy({ userId: user.id })

            return this.paymentService.createPayment(subscription)
        } else if (action === ActionsEnum.SUBSCRIPTION_STOP) {
            return this.stopSubscription(user.id)
        }
    }

    async create(user: User, planId: string) {
        const subscription = await this.subscriptionRepository.findOneBy({
            userId: user.id,
        })

        console.log(subscription)

        if (subscription) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'Subscription already exists')
        }

        return this.subscriptionRepository.save({
            userId: user.id,
            planId: planId,
            startAt: new Date(),
            nextPayAt: new Date(),
            yookassaPaymentId: '',
            status: StatusesEnum.PENDING,
        })
    }

    async find() {
        return this.subscriptionRepository.find()
    }

    async activateSubscription(subscriptionId: string) {
        const subscription = await this.getOne({
            where: { id: subscriptionId },
            relations: { plan: true, user: true },
        })

        subscription.status = StatusesEnum.ACTIVE
        subscription.yookassaPaymentId = subscription.yookassaPaymentId ?? ''

        if (!subscription.startAt) {
            subscription.startAt = new Date()
        }

        if (!subscription.nextPayAt) {
            subscription.nextPayAt = new Date()
        }

        subscription.nextPayAt.setDate(subscription.startAt.getDate() + subscription.plan.period)

        return subscription.save()
    }
}
