import { Injectable } from '@nestjs/common'
import { BaseService } from '@common/database/base/base.service'
import { Group } from '../entity/group.entity'
import { CreateGroupDto } from '../dto/create-group.dto'
import { UpdateGroupDto } from '../dto/update-group.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { UserService } from '../../system/user/services/user.service'
import { ChatService } from '../../chat/services/chat.service'

@Injectable()
export class GroupService extends BaseService<Group, CreateGroupDto, UpdateGroupDto> {
    constructor(
        @InjectRepository(Group) private readonly groupRepository: Repository<Group>,
        private readonly userService: UserService,
        private readonly chatService: ChatService,
    ) {
        super(groupRepository)
    }

    async getGroupById(groupId: string) {
        return this.groupRepository.findOneBy({ id: groupId })
    }

    async createGroup(userIds: string[]) {
        return this.groupRepository.save({
            userIds,
        })
    }

    async addUserToGroup(groupId: string, userId: string, invite: boolean = true) {
        const group = await this.groupRepository.findOneBy({ id: groupId })

        if (!group) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND, `Group ${groupId} not found`)
        }

        const userToAdd = await this.userService.findOne({ where: { id: userId } })

        if (!userToAdd) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND, `User ${userId} not found`)
        }

        if (group.userIds.indexOf(userId) === -1) {
            group.userIds.push(userId)
        }

        if (invite) {
            await this.chatService.inviteUserToChat(userToAdd, group.tgChatId)
        }

        return group.save()
    }

    async removeUserFromGroup(groupId: string, userId: string) {
        const group = await this.groupRepository.findOneBy({ id: groupId })

        if (!group) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND, `Group ${groupId} not found`)
        }

        const userToRemove = await this.userService.findOne({ where: { id: userId } })

        if (!userToRemove) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND, `User ${userId} not found`)
        }

        group.userIds = group.userIds.filter((groupUserId) => groupUserId !== userId)

        await this.chatService.kickUserFromChat(userToRemove, group.tgChatId)

        return group.save()
    }
}
