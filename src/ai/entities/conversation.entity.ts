// import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
// import { ApiProperty } from '@nestjs/swagger'
// import { BaseEntity } from '@common/database/base/base.entity'
// import { User } from '../../system/user/entity/user.entity'
// import { Message } from './message.entity'

// @Entity('conversations')
// export class Conversation extends BaseEntity {
//     @ApiProperty()
//     @Column({ name: 'user_id' })
//     userId: string

//     @ApiProperty({ type: () => User })
//     @ManyToOne(() => User, (user) => user.conversations)
//     @JoinColumn({ name: 'user_id' })
//     user: User

//     @ApiProperty()
//     @Column({ name: 'name', default: '' })
//     name: string

//     @ApiProperty()
//     @Column({ name: 'input_tokens', default: 0 })
//     inputTokens: number

//     @ApiProperty()
//     @Column({ name: 'output_tokens', default: 0 })
//     outputTokens: number

//     @ApiProperty()
//     @Column({ name: 'reasoning_tokens', default: 0 })
//     reasoningTokens: number

//     @ApiProperty()
//     @OneToMany(() => Message, (message) => message.conversation)
//     messages: Message[]
// }
