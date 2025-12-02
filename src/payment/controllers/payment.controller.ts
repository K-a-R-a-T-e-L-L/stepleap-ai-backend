import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserService } from '../../system/user/services/user.service'
import { SubscriptionService } from '../../subscription/services/subscription.service'
import { StatusesEnum } from '../../subscription/enum/statuses.enum'
import { PaymentService } from '../services/payment.service'

@Controller('payments')
@ApiTags('Payments')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService
    ) {}

    @Post('webhook')
    async yookassaWebhook(@Body() data: any) {
        return this.paymentService.handleYookassaWebhook(data)
    }
}