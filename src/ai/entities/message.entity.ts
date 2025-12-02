import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { BaseEntity } from '@common/database/base/base.entity'
import { Conversation } from './conversation.entity'
import { ApiProperty } from '@nestjs/swagger'
import { File } from '../../file/entity/file.entity'

@Entity('messages')
export class Message extends BaseEntity {
    @ApiProperty()
    @Column()
    role: string

    @ApiProperty()
    @Column({ nullable: true })
    content?: string

    @ApiProperty()
    @Column({ default: 0 })
    tokens?: number

    @ApiProperty({ type: () => [File] })
    @OneToMany(() => File, (file) => file.message, { eager: true })
    files?: File[]

    @ApiProperty({ type: () => Conversation })
    @ManyToOne(() => Conversation)
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation

    @ApiProperty()
    @Column({ name: 'conversation_id' })
    conversationId: string
}
