import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '@common/database/base/base.entity'
import { Conversation } from './conversation.entity'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { File } from 'src/file/entity/file.entity'

export class MessageItem {
    @ApiProperty({
        type: 'string',
        enum: ['TEXT', 'VIDEO'],
    })
    type: 'TEXT' | 'VIDEO'

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(File) }],
    })
    content: string | File
}

@Entity()
export class Message extends BaseEntity {
    @ApiProperty({
        type: 'string',
        enum: ['user', 'assistant'],
    })
    @Column()
    role: 'user' | 'assistant'

    @ApiProperty({ type: () => [MessageItem] })
    @Column({ type: 'jsonb', default: [] })
    items: MessageItem[]

    @ApiProperty({ type: () => Conversation })
    @ManyToOne(() => Conversation)
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation

    @ApiProperty()
    @Column({ name: 'conversation_id' })
    conversationId: string
}
