import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { BaseService } from '@common/database/base/base.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Payment } from '../entity/payment.entity'
import { CreatePaymentDto } from '../dto/create-payment.dto'
import { UpdatePaymentDto } from '../dto/update-payment.dto'
import { ConfirmationEnum, CurrencyEnum, PaymentCreateRequest, YookassaService } from 'nestjs-yookassa'
import { SubscriptionService } from '../../subscription/services/subscription.service'
import { Subscription } from '../../subscription/entity/subscription.entity'
import { Plan } from '../../plan/entity/plan.entity'
import { InjectBot } from 'nestjs-telegraf'
import { Telegraf } from 'telegraf'
import { ConfigService } from '@nestjs/config'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'

@Injectable()
export class PaymentService extends BaseService<Payment, CreatePaymentDto, UpdatePaymentDto> {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(Plan) private readonly planRepository: Repository<Plan>,
        private readonly yookassaService: YookassaService,
        @Inject(forwardRef(() => SubscriptionService)) private readonly subscriptionService: SubscriptionService,
        @InjectBot() private readonly bot: Telegraf,
    ) {
        super(paymentRepository)
    }

    async createPayment(subscription: string | Subscription, planId?: string) {
        if (typeof subscription === 'string') {
            subscription = await this.subscriptionService.getOne({
                where: { id: subscription },
                relations: { plan: true },
            })
        }

        if (!subscription) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND, 'Subscription not found')
        }
        if (!subscription.plan) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND, 'Plan not found for subscription')
        }

        let billedPlan = subscription.plan
        if (planId && planId !== subscription.planId) {
            const targetPlan = await this.planRepository.findOne({ where: { id: planId } })
            if (!targetPlan) {
                throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND, 'Plan not found')
            }
            billedPlan = targetPlan
        }

        const paymentData: PaymentCreateRequest = {
            amount: {
                value: billedPlan.amount,
                currency: CurrencyEnum.RUB,
            },
            description: `Payment for subscription ${subscription.id}`,
            capture: true,
            confirmation: {
                type: ConfirmationEnum.redirect,
                return_url: process.env.FRONTEND_URL,
            },
            metadata: {
                subscription_id: subscription.id,
                plan_id: billedPlan.id,
            },
        }

        return this.yookassaService.createPayment(paymentData)
    }

    async handleYookassaWebhook(data: any) {
        if (data?.event !== 'payment.succeeded') {
            return { ok: true }
        }

        const subscriptionId = data.object.metadata.subscription_id
        const planId = data?.object?.metadata?.plan_id

        if (planId) {
            return this.subscriptionService.applyPaidPlan(subscriptionId, planId, data.object.payment_method.id)
        }

        return this.subscriptionService.renewSubscription(subscriptionId, data.object.payment_method.id)
    }
}
