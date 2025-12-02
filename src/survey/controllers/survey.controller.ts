import { Controller, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { SurveyService } from '../services/survey.service'
import { UserDockGetMany, UserDockGetOne } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { Survey } from '../entity/survey.entity'
import { SurveysPaginated } from '@common/pagination/paginated.configs'
import { Paginate, PaginateQuery } from 'nestjs-paginate'

@Controller('surveys')
@ApiTags('Surveys')
export class SurveyController {
    constructor(private readonly surveyService: SurveyService) {}

    @UserDockGetMany('', UserAuthType.NOT_AUTH, Survey, SurveysPaginated, 'Получить все анкеты всех пользователей')
    async getAll(@Paginate() query: PaginateQuery) {
        return this.surveyService.findAll(query, SurveysPaginated);
    }

    @UserDockGetOne(':uuid', UserAuthType.NOT_AUTH, Survey, 'Получить анкету по uuid')
    async getOne(@Param('uuid') uuid: string) {
        return this.surveyService.findOne(uuid);
    }
}