import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CareerController } from './career.controller'
import { CareerEpisodeCacheEntity } from './entity/career-episode-cache.entity'
import { CareerEpisodeProgressEntity } from './entity/career-episode-progress.entity'
import { CareerService } from './career.service'
import { CareerProfileEntity } from './entity/career-profile.entity'
import { CareerProofEntity } from './entity/career-proof.entity'
import { CareerRecommendationEntity } from './entity/career-recommendation.entity'
import { CareerVacancyCacheEntity } from './entity/career-vacancy-cache.entity'
import { CareerVacancyNormalizedEntity } from './entity/career-vacancy-normalized.entity'
import { CareerVacancyRawEntity } from './entity/career-vacancy-raw.entity'

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([
            CareerProfileEntity,
            CareerEpisodeCacheEntity,
            CareerEpisodeProgressEntity,
            CareerRecommendationEntity,
            CareerVacancyCacheEntity,
            CareerVacancyRawEntity,
            CareerVacancyNormalizedEntity,
            CareerProofEntity,
        ]),
    ],
    controllers: [CareerController],
    providers: [CareerService],
})
export class CareerModule {}
