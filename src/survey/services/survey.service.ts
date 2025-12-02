import { Injectable } from '@nestjs/common'
import { BaseService } from '@common/database/base/base.service'
import { Survey } from '../entity/survey.entity'
import { CreateSurveyDto } from '../dto/create-survey.dto'
import { UpdateSurveyDto } from '../dto/update-survey.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../system/user/entity/user.entity'

@Injectable()
export class SurveyService extends BaseService<Survey, CreateSurveyDto, UpdateSurveyDto> {
    constructor(@InjectRepository(Survey) private readonly surveyRepository: Repository<Survey>) {
        super(surveyRepository)
    }

    async createSurvey(user: User, createSurveyDto: CreateSurveyDto) {
        return this.surveyRepository.save({
            userId: user.id,
            ...createSurveyDto,
        })
    }

    async updateSurvey(user: User, updateSurveyDto: UpdateSurveyDto) {
        return this.surveyRepository.update(
            {
                userId: user.id,
            },
            updateSurveyDto,
        )
    }

    async deleteUserSurvey(userId: string) {
        return this.surveyRepository.delete({
            userId: userId,
        })
    }
}
