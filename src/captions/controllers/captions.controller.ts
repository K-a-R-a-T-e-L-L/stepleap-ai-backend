import { Body, Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserDockGetOne } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { File } from '../../file/entity/file.entity'
import { CaptionsService } from '../services/captions.service'
import { CreateVideoDto } from '../dto/create-video.dto'

@ApiTags('Captions')
@Controller('captions')
export class CaptionsController {
    constructor(
        private readonly captionsService: CaptionsService
    ) {
    }

    @Get('')
    async createVideo(@Body() createVideoDto: any) {
        return this.captionsService.createVideo(createVideoDto.imageReference, createVideoDto.audioReference)
    }

    @Get(':videoId/status')
    async checkVideoStatus(@Param('videoId') videoId: string) {
        return this.captionsService.checkVideoStatus(videoId)
    }

    @Get(':videoId/download')
    async downloadVideo(@Param('videoId') videoId: string) {
        return this.captionsService.downloadVideo(videoId)
    }
}