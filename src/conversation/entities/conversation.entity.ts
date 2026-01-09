import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { BaseEntity } from '@common/database/base/base.entity'
import { User } from '../../system/user/entity/user.entity'
import { Message } from './message.entity'

@Entity()
export class Conversation extends BaseEntity {
    @ApiProperty()
    @Column({ name: 'user_id' })
    userId: string

    @ApiProperty({ type: () => User })
    @ManyToOne(() => User, (user) => user.conversations)
    @JoinColumn({ name: 'user_id' })
    user: User

    @ApiProperty()
    @Column({ name: 'name', default: '' })
    name: string

    @ApiProperty({ type: () => [Message] })
    @OneToMany(() => Message, (message) => message.conversation)
    messages: Message[]

    @ApiProperty()
    @Column({ default: 'GEMINI' })
    model: string
}
