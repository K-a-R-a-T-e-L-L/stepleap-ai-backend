import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, Index } from 'typeorm'

import { BaseEntity } from '@common/database/base/base.entity'
import { ChatModelEnum } from '../enum/chat-model.enum'

@Entity('chat_dialogs')
@Index(['userId', 'model', 'updatedAt'])
export class ChatDialog extends BaseEntity {
    @ApiProperty()
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string

    @ApiProperty({ enum: ChatModelEnum })
    @Column({ type: 'enum', enum: ChatModelEnum })
    model: ChatModelEnum

    @ApiProperty()
    @Column({ type: 'varchar', length: 120 })
    title: string
}
