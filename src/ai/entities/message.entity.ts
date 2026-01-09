// import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
// import { BaseEntity } from '@common/database/base/base.entity'
// import { Conversation } from './conversation.entity'
// import { ApiProperty } from '@nestjs/swagger'
// import { File } from '../../file/entity/file.entity'

// @Entity('messages')
// export class Message extends BaseEntity {
//     @ApiProperty()
//     @Column()
//     input: any

//     @ApiProperty()
//     @Column()
//     output: any

//     @ApiProperty({ type: () => Conversation })
//     @ManyToOne(() => Conversation)
//     @JoinColumn({ name: 'conversation_id' })
//     conversation: Conversation

//     @ApiProperty()
//     @Column({ name: 'conversation_id' })
//     conversationId: string
// }
