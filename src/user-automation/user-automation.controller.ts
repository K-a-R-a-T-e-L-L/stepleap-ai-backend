import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { UserAuth, UserAuthType } from '@common/decorators/auth.helpers'
import { UserDecorator } from '../system/user/decorators/user.decorator'
import { User } from '../system/user/entity/user.entity'
import { UserAutomationService } from './user-automation.service'
import { CreateUserAutomationDto } from './dto/create-user-automation.dto'
import { UpdateUserAutomationDto } from './dto/update-user-automation.dto'
import { UserAutomation } from './entities/user-automation.entity'
import { RunAutomationDto } from './dto/run-automation.dto'
import { AutomationRunLog } from '../automation-run-log/entities/automation-run-log.entity'

@Controller('automations')
@ApiTags('User automations')
export class UserAutomationController {
    constructor(private readonly userAutomationService: UserAutomationService) {}

    @Post()
    @UserAuth(UserAuthType.USER)
    @ApiOperation({ summary: 'Create user automation' })
    @ApiResponse({ status: 201, type: UserAutomation })
    create(@UserDecorator() user: User, @Body() createUserAutomationDto: CreateUserAutomationDto) {
        return this.userAutomationService.create(user.id, createUserAutomationDto)
    }

    @Get()
    @UserAuth(UserAuthType.USER)
    @ApiOperation({ summary: 'List user automations' })
    @ApiResponse({ status: 200, type: [UserAutomation] })
    findAll(@UserDecorator() user: User) {
        return this.userAutomationService.findAll(user.id)
    }

    @Get(':id')
    @UserAuth(UserAuthType.USER)
    @ApiOperation({ summary: 'Get user automation by id' })
    @ApiResponse({ status: 200, type: UserAutomation })
    findOne(@UserDecorator() user: User, @Param('id') id: string) {
        return this.userAutomationService.findOneForUser(user.id, id)
    }

    @Patch(':id')
    @UserAuth(UserAuthType.USER)
    @ApiOperation({ summary: 'Update user automation by id' })
    @ApiResponse({ status: 200, type: UserAutomation })
    update(
        @UserDecorator() user: User,
        @Param('id') id: string,
        @Body() updateUserAutomationDto: UpdateUserAutomationDto,
    ) {
        return this.userAutomationService.updateForUser(user.id, id, updateUserAutomationDto)
    }

    @Delete(':id')
    @UserAuth(UserAuthType.USER)
    @ApiOperation({ summary: 'Delete user automation by id' })
    remove(@UserDecorator() user: User, @Param('id') id: string) {
        return this.userAutomationService.removeForUser(user.id, id)
    }

    @Post(':id/run')
    @UserAuth(UserAuthType.USER)
    @ApiOperation({ summary: 'Run user automation (webhook to n8n)' })
    @ApiResponse({ status: 201, type: AutomationRunLog })
    run(
        @UserDecorator() user: User,
        @Param('id') id: string,
        @Body() runAutomationDto: RunAutomationDto,
    ) {
        return this.userAutomationService.run(user.id, id, runAutomationDto)
    }
}
