import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { UserAuth, UserAuthType } from '@common/decorators/auth.helpers'
import { SubscriptionService } from '../services/subscription.service'

@ApiTags('Admin subscriptions')
@Controller('admin/subscriptions')
export class AdminSubscriptionController {
    constructor(private readonly subscriptionService: SubscriptionService) {}

    @Post('activate')
    @UserAuth(UserAuthType.ADMIN)
    @ApiOperation({ summary: 'Activate subscription by id' })
    activate(@Body('subscriptionId') subscriptionId: string) {
        return this.subscriptionService.activateSubscription(subscriptionId)
    }
}
