import { Body, Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserDockDelete, UserDockGetOne, UserDockPost, UserDockPut } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { Survey } from '../entity/survey.entity'
import { UserDecorator } from '../../system/user/decorators/user.decorator'
import { User } from '../../system/user/entity/user.entity'
import { SurveyService } from '../services/survey.service'
import { CreateSurveyDto } from '../dto/create-survey.dto'
import { UpdateSurveyDto } from '../dto/update-survey.dto'

@Controller('user/survey')
@ApiTags('User Surveys')
export class SurveyUserController {
    constructor(private readonly surveyService: SurveyService) {}

    @UserDockGetOne('', UserAuthType.USER, Survey, 'Получить анкету пользователя')
    async getUserSurvey(@UserDecorator() user: User) {
        return this.surveyService.getOne({
            where: {
                userId: user.id,
            },
        })
    }

    @UserDockPost('', UserAuthType.USER, CreateSurveyDto, Survey, 'Создать анкету пользователя')
    async createSurvey(@UserDecorator() user: User, @Body() createSurveyDto: CreateSurveyDto) {
        return this.surveyService.createSurvey(user, createSurveyDto)
    }

    @UserDockPut('survey', UserAuthType.USER, UpdateSurveyDto, Survey, 'Изменить анкету пользователя')
    async updateSurvey(@UserDecorator() user: User, @Body() updateSurveyDto: UpdateSurveyDto) {
        return this.surveyService.updateSurvey(user, updateSurveyDto)
    }

    @UserDockDelete('', UserAuthType.USER, Survey, 'Удалить анкету пользователя')
    async deleteSurvey(@UserDecorator() user: User) {
        return this.surveyService.deleteUserSurvey(user.id)
    }
}
