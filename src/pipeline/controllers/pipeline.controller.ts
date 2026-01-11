import { UserAuthType } from '@common/decorators/auth.helpers'
import { UserDockGetManyNotPaginate, UserDockGetOne, UserDockPost } from '@common/swagger/user.swagger.helper'
import { Controller, Body, Param } from '@nestjs/common'
import { PipelineService } from '../services/pipeline.service'
import { CreatePipelineDto } from '../dto/create-pipeline.dto'
import { CreateStepDto } from '../dto/create-step.dto'
import { Pipeline } from '../entities/pipeline.entity'
import { UserDecorator } from 'src/system/user/decorators/user.decorator'
import { User } from 'src/system/user/entity/user.entity'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { PipelineStep } from '../entities/pipeline-step.entity'

@Controller('pipelines')
export class PipelineController {
    constructor(private readonly pipelineService: PipelineService) {}

    @UserDockGetManyNotPaginate('', UserAuthType.USER, Pipeline)
    async getUserPipelines(@UserDecorator() user: User) {
        return this.pipelineService.getUserPipelines(user)
    }

    @UserDockPost('', UserAuthType.USER, null, Pipeline)
    async createPipeline(@UserDecorator() user: User) {
        return this.pipelineService.createPipeline(user)
    }

    @UserDockPost(':pipelineId/steps', UserAuthType.USER, CreateStepDto, PipelineStep)
    async createStep(
        @UserDecorator() user: User,
        @Param('pipelineId') pipelineId: string,
        @Body() createStepDto: CreateStepDto,
    ) {
        if (!this.pipelineService.pipelineBelongsToUser(pipelineId, user))
            throw new ErrorDto(ErrorCodeEnum.UNAUTHORIZED, 'Pipeline does not belong to the user')

        return this.pipelineService.addStepToPipeline({
            stepDto: createStepDto,
            pipelineId,
        })
    }

    @UserDockGetOne(':pipelineId/execute', UserAuthType.NOT_AUTH, Pipeline)
    async executePipeline(@Param('pipelineId') pipelineId: string) {
        return this.pipelineService.executePipeline({
            pipelineId,
        })
    }
}
