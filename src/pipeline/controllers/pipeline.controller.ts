import { UserAuthType } from '@common/decorators/auth.helpers'
import { UserDockPost } from '@common/swagger/user.swagger.helper'
import { Controller, Body } from '@nestjs/common'
import { PipelineService } from '../services/pipeline.service'
import { CreatePipelineDto } from '../dto/create-pipeline.dto'

@Controller('pipeline')
export class PipelineController {
    constructor(private readonly pipelineService: PipelineService) {}

    @UserDockPost('create', UserAuthType.NOT_AUTH, CreatePipelineDto)
    async createPipeline(@Body() createPipelineDto: CreatePipelineDto) {
        return this.pipelineService.createPipeline(createPipelineDto)
    }
}
