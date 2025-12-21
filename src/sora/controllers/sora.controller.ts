import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UserDockGetOne, UserDockPost } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { File } from '../../file/entity/file.entity'
import { SoraService } from '../services/sora.service'
import { CreateVideoDto } from '../dto/create-sora-video.dto'

@ApiTags('Sora')
@Controller('sora')
export class SoraController {
    constructor(private readonly soraService: SoraService) {}

    @UserDockPost('', UserAuthType.USER, CreateVideoDto)
    async createVideo(@Body() createVideoDto: any) {
        return this.soraService.createVideo(createVideoDto)
    }

    @UserDockGetOne('/:videoId/status', UserAuthType.USER)
    async checkVideoStatus(@Param('videoId') videoId: string) {
        return this.soraService.checkVideoStatus(videoId)
    }

    @UserDockGetOne(':videoId/download', UserAuthType.USER, File)
    async downloadVideo(@Param('videoId') videoId: string) {
        return this.soraService.downloadVideo(videoId)
    }
}
