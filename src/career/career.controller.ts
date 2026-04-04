import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger'
import { UserAuth, UserAuthType } from '../../common/decorators/auth.helpers'
import { UserDecorator } from '../system/user/decorators/user.decorator'
import { User } from '../system/user/entity/user.entity'
import { CareerEpisodeDto, CompleteCareerEpisodeDto, CompleteCareerEpisodeResponseDto } from './dto/career-episode.dto'
import { CareerProfileDto } from './dto/career-profile.dto'
import { CareerProfileStateDto } from './dto/career-profile-state.dto'
import { CareerRecommendationsResponseDto } from './dto/career-recommendations.dto'
import { CareerProofDto } from './dto/career-proof.dto'
import { CareerVacancyDto } from './dto/career-vacancy.dto'
import { CareerService } from './career.service'

@ApiTags('Career')
@Controller('career')
@UserAuth(UserAuthType.USER)
export class CareerController {
    constructor(private readonly careerService: CareerService) {}

    @Get('profile')
    @ApiOkResponse({ type: CareerProfileStateDto })
    getProfile(@UserDecorator() user: User) {
        return this.careerService.getProfile(user.telegramId)
    }

    @Post('profile')
    @ApiOkResponse({ type: CareerProfileStateDto })
    saveProfile(@Body() profile: CareerProfileDto, @UserDecorator() user: User) {
        return this.careerService.saveProfile(profile, user.telegramId)
    }

    @Post('recommendations')
    @ApiOkResponse({ type: CareerRecommendationsResponseDto })
    async getRecommendations(@Body() profile: CareerProfileDto, @UserDecorator() user: User) {
        return this.careerService.getRecommendations(profile, true, user.telegramId)
    }

    @Get('vacancies')
    @ApiQuery({ name: 'trackId', required: false, type: String })
    @ApiOkResponse({ type: [CareerVacancyDto] })
    getVacancies(@Query('trackId') trackId: string | undefined, @UserDecorator() user: User) {
        return this.careerService.getVacancies(trackId, user.telegramId)
    }

    @Post('vacancies/sync')
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                syncedAt: { type: 'string' },
            },
        },
    })
    syncVacancies() {
        return this.careerService.syncVacanciesNow()
    }

    @Get('episodes')
    @ApiQuery({ name: 'trackId', required: false, type: String })
    @ApiOkResponse({ type: [CareerEpisodeDto] })
    getEpisodes(@Query('trackId') trackId: string | undefined, @UserDecorator() user: User) {
        return this.careerService.getEpisodes(trackId, user.telegramId)
    }

    @Post('episodes/complete')
    @ApiOkResponse({ type: CompleteCareerEpisodeResponseDto })
    completeEpisode(@Body() payload: CompleteCareerEpisodeDto, @UserDecorator() user: User) {
        return this.careerService.completeEpisode(payload, user.telegramId)
    }

    @Get('proofs')
    @ApiOkResponse({ type: [CareerProofDto] })
    getProofs(@UserDecorator() user: User) {
        return this.careerService.getProofs(user.telegramId)
    }
}
