import { Body, Controller, Get, Param } from '@nestjs/common'
import { KlingService } from '../services/kling.service'
import { UserDockGetOne, UserDockPost } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { CreateVideoKlingDto } from '../dto/create-video-kling.dto'
import { create } from 'domain'

@Controller('kling')
export class KlingController {
    constructor(private readonly klingService: KlingService) {}

    @UserDockPost('videos', UserAuthType.NOT_AUTH, CreateVideoKlingDto)
    async createVideo(@Body() createVideoKlingDto: CreateVideoKlingDto) {
        return this.klingService.createVideo({
            modelName: createVideoKlingDto.modelName,
            prompt: createVideoKlingDto.prompt,
        })
    }

    @UserDockGetOne('videos/:taskId', UserAuthType.NOT_AUTH)
    async checkVideo(@Param('taskId') taskId: string) {
        return this.klingService.checkVideo({ taskId })
    }
}
