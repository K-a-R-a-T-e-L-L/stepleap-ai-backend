import { Injectable } from '@nestjs/common'
import { BaseService } from '@common/database/base/base.service'
import { Chat } from '../entity/chat.entity'
import { CreateChatDto } from '../dto/create-chat.dto'
import { UpdateChatDto } from '../dto/update-chat.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../system/user/entity/user.entity'
import { InjectBot } from 'nestjs-telegraf'
import { Telegraf } from 'telegraf'
import { NotificationService } from '../../notification/notification.service'
import { TelegramLoggerService } from '../../logger/logger.service'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { GroupService } from '../../group/services/group.service'
import { UserService } from '../../system/user/services/user.service'

@Injectable()
export class ChatService extends BaseService<Chat, CreateChatDto, UpdateChatDto> {
    constructor(
        @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
        @InjectBot() private readonly bot: Telegraf,
        private readonly notificationService: NotificationService,
        private readonly logger: TelegramLoggerService,
        // private readonly groupService: GroupService,
        private readonly userService: UserService
    ) {
        super(chatRepository);
    }

    async find() {
        return this.chatRepository.find()
    }

    async inviteUserToAllChats(user: User) {
        const chats = await this.find()

        for (let chat of chats) {
            await this.inviteUserToChat(user, chat)
        }
    }

    async kickUserFromAllChats(user: User) {
        const chats = await this.find()

        for (let chat of chats) {
            await this.kickUserFromChat(user, chat)
        }
    }

    async inviteUserToChat(user: User, chat: Chat | string) {
        const inviteLink = await this.bot.telegram.createChatInviteLink(typeof chat === 'string' ? chat : chat.tg_id)
        await this.notificationService.notify(user.telegramId, `Group invite: ${inviteLink.invite_link}`)
    }

    async kickUserFromChat(user: User, chat: Chat | string) {
        try {
            await this.bot.telegram.banChatMember(typeof chat === 'string' ? chat : chat.tg_id, user.telegramId)
        } catch (e) {
            this.logger.error(e)
            console.error(e)
        }
    }
}