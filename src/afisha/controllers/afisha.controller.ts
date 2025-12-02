import { Controller, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AfishaService } from '../services/afisha.service'
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { AfishaPaginated } from '@common/pagination/paginated.configs'
import { UserDockGetMany, UserDockGetOne } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { Afisha } from '../entity/afisha.entity'

@Controller('afisha')
@ApiTags('Afisha')
export class AfishaController {
    constructor(private readonly afishaService: AfishaService) {}

    @UserDockGetMany('', UserAuthType.USER, Afisha, AfishaPaginated, 'Получить все афиши')
    async get(@Paginate() query: PaginateQuery) {
        return this.afishaService.findAll(query, AfishaPaginated)
    }

    @UserDockGetOne(':id', UserAuthType.USER, Afisha, 'Получить афишу по id')
    async getById(@Param('id') id: string) {
        return this.afishaService.findOne(id)
    }
}