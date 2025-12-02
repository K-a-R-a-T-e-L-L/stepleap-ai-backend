import { Injectable } from '@nestjs/common'
import { BaseService } from '@common/database/base/base.service'
import { RandomCoffee } from '../entity/random-coffee.entity'
import { CreateRandomCoffeeDto } from '../dto/create-random-coffee.dto'
import { UpdateRandomCoffeeDto } from '../dto/update-random-coffee.dto'
import { PaginateConfig, PaginateQuery } from 'nestjs-paginate'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Cron, CronExpression } from '@nestjs/schedule'
import { UserService } from '../../system/user/services/user.service'
import { PlanService } from '../../plan/services/plan.service'
import { NotificationService } from '../../notification/notification.service'
import { RandomCoffeeUsers } from '../entity/random-coffee-users.entity'

@Injectable()
export class RandomCoffeeService extends BaseService<RandomCoffee, CreateRandomCoffeeDto, UpdateRandomCoffeeDto> {
    constructor(
        @InjectRepository(RandomCoffee) private readonly randomCoffeeRepository: Repository<RandomCoffee>,
        private readonly userService: UserService,
        private readonly planService: PlanService,
        private readonly notificationService: NotificationService,
    ) {
        super(randomCoffeeRepository)
    }

    @Cron(CronExpression.EVERY_WEEK)
    async createRandomCoffee() {
        const newRandomCoffee = new RandomCoffee()
        await newRandomCoffee.save()

        const users = await this.userService.find()

        for (let user of users) {
            await this.notificationService.notify(user.telegramId, 'Хотите сходить на встречу?')
        }
    }

    async addUserToRandomCoffee(tgId: number) {
        const user = await this.userService.getUserByTelegramId(tgId)
        const randomCoffee = (await this.randomCoffeeRepository.find())[0]

        randomCoffee.userIds.push(user.id)

        return randomCoffee.save()
    }

    @Cron(CronExpression.EVERY_WEEKEND)
    async formPairs() {
        const randomCoffeeUserIds = (await this.randomCoffeeRepository.find())[0].userIds

        while (randomCoffeeUserIds.length > 1) {
            const newPair = new RandomCoffeeUsers()
            newPair.userIdOne = randomCoffeeUserIds.pop()
            newPair.userIdTwo = randomCoffeeUserIds.pop()
            await newPair.save()

            const user1 = await this.userService.findOne({ where: { id: newPair.userIdOne } })
            const user2 = await this.userService.findOne({ where: { id: newPair.userIdTwo } })

            await this.notificationService.notify(
                user1.telegramId,
                `Ваш собеседник на этой неделе: t.me/${user2.telegramId}`,
            )
            await this.notificationService.notify(
                user2.telegramId,
                `Ваш собеседник на этой неделе: t.me/${user1.telegramId}`,
            )
        }

        if (randomCoffeeUserIds.length === 1) {
            const remainingUser = await this.userService.findOne({ where: { id: randomCoffeeUserIds[0] } })
            await this.notificationService.notify(
                remainingUser.telegramId,
                'Извините, для вас встречи на этой неделе не будет',
            )
        }
    }
}
