import { Controller, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { WebinarService } from '../services/webinar.service'
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { WebinarsPaginated } from '@common/pagination/paginated.configs'
import { UserDockGetMany, UserDockGetOne } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { Webinar } from '../entity/webinar.entity'

@Controller('webinars')
@ApiTags('Webinars')
export class WebinarController {
    constructor(private readonly webinarService: WebinarService) {}

    @UserDockGetMany('', UserAuthType.USER, Webinar, WebinarsPaginated, 'Получить все вебинары')
    async get(@Paginate() query: PaginateQuery) {
        return this.webinarService.findAll(query, WebinarsPaginated)
    }

    @UserDockGetOne(':id', UserAuthType.USER, Webinar, 'Получить вебинар по id')
    async getById(@Param('id') id: string) {
        return this.webinarService.findOne(id)
    }
}
