import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserDockGetOne, UserDockPost } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { File } from '../../file/entity/file.entity'
import { CaptionsService } from '../services/captions.service'
import { CreateVideoDto } from '../dto/create-video.dto'
import { CaptionsResponseDto } from '../dto/captions-response.dto'

@ApiTags('Captions')
@Controller('captions')
export class CaptionsController {
    constructor(private readonly captionsService: CaptionsService) {}

    @UserDockPost('', UserAuthType.USER, CreateVideoDto, CaptionsResponseDto)
    async createVideo(@Body() createVideoDto: any) {
        return this.captionsService.createVideo(createVideoDto.imageReference, createVideoDto.audioReference)
    }

    @UserDockPost('captions', UserAuthType.NOT_AUTH)
    async createVideoCaptions(@Body() createVideoDto: any) {
        return this.captionsService.addCaptionToVideo({ videoUrl: createVideoDto.videoUrl })
    }

    @UserDockGetOne('/:videoId/status', UserAuthType.NOT_AUTH, CaptionsResponseDto)
    async checkVideoStatus(@Param('videoId') videoId: string) {
        return this.captionsService.checkVideoStatus(videoId)
    }

    @UserDockGetOne(':videoId/download', UserAuthType.NOT_AUTH, File)
    async downloadVideo(@Param('videoId') videoId: string) {
        return this.captionsService.downloadVideo(videoId)
    }
}
