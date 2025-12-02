import { Body, Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { RandomCoffeeService } from '../services/random-coffee.service'
import { PlansPaginated } from '@common/pagination/paginated.configs'
import { UserDockGetMany, UserDockPost } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { CreateRandomCoffeeDto } from '../dto/create-random-coffee.dto'
import { UserDecorator } from '../../system/user/decorators/user.decorator'
import { User } from '../../system/user/entity/user.entity'
import { RandomCoffee } from '../entity/random-coffee.entity'

@Controller('random-coffee')
@ApiTags('Random Coffee')
export class RandomCoffeeController {
    constructor(private readonly randomCoffeeService: RandomCoffeeService) {}

    @UserDockPost('add', UserAuthType.USER, null, RandomCoffee, 'Добавить пользователя в список потенциальных кандидатов для Random Coffee')
    async post(@UserDecorator() user: User) {
        return this.randomCoffeeService.addUserToRandomCoffee(user.telegramId)
    }
}