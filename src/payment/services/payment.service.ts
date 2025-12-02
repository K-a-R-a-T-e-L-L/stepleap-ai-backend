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
import { InjectBot } from 'nestjs-telegraf'
import { Telegraf } from 'telegraf'
import { ConfigService } from '@nestjs/config'
import { ChatService } from '../../chat/services/chat.service'

@Injectable()
export class PaymentService extends BaseService<Payment, CreatePaymentDto, UpdatePaymentDto> {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
        private readonly yookassaService: YookassaService,
        @Inject(forwardRef(() => SubscriptionService)) private readonly subscriptionService: SubscriptionService,
        private readonly chatService: ChatService,
        @InjectBot() private readonly bot: Telegraf,
    ) {
        super(paymentRepository)
    }

    async createPayment(subscription: string | Subscription) {
        if (typeof subscription === 'string') {
            subscription = await this.subscriptionService.getOne({
                where: { id: subscription },
                relations: { plan: true },
            })
        }

        const paymentData: PaymentCreateRequest = {
            amount: {
                value: subscription.plan.amount,
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
            },
        }

        return this.yookassaService.createPayment(paymentData)
    }

    async handleYookassaWebhook(data: any) {
        const subscriptionId = data.object.metadata.subscription_id

        return this.subscriptionService.renewSubscription(subscriptionId, data.object.payment_method.id)
    }
}
