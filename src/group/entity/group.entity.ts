import { Entity, Column, ManyToMany, JoinTable } from 'typeorm'
import { BaseEntity } from '@common/database/base/base.entity'
import { User } from '../../system/user/entity/user.entity'
import { Chat } from '../../chat/entity/chat.entity'

@Entity('groups')
export class Group extends BaseEntity {
    @Column({ name: 'tg_chat_id', type: 'bigint' })
    tgChatId: string

    @Column({ name: 'user_ids', type: 'simple-array' })
    userIds: string[]
}