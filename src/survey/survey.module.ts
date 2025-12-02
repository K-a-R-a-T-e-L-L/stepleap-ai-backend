import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Survey } from './entity/survey.entity'
import { SurveyService } from './services/survey.service'
import { SurveyController } from './controllers/survey.controller'
import { JwtModule } from '@nestjs/jwt'
import { SurveyUserController } from './controllers/survey.user.controller'

@Module({
    imports: [TypeOrmModule.forFeature([Survey]), JwtModule],
    providers: [SurveyService],
    controllers: [SurveyController, SurveyUserController],
    exports: [SurveyService],
})
export class SurveyModule {}
