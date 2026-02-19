import {Controller} from '@nestjs/common'
import {ApiTags} from '@nestjs/swagger'
import {UserDockGetManyNotPaginate} from '@common/swagger/user.swagger.helper'
import {UserAuthType} from '@common/decorators/auth.helpers'
import {SubscriptionService} from "../services/subscription.service";
import {UserService} from "../../system/user/services/user.service";
import {Subscription} from "../entity/subscription.entity";

@Controller('admin/subscriptions')
@ApiTags('Admin subscriptions')
export class SubscriptionController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly userService: UserService
    ) {}

    @UserDockGetManyNotPaginate('', UserAuthType.ADMIN, Subscription)
    async get() {
        return this.subscriptionService.find()
    }
}
