import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, Index } from 'typeorm'

import { BaseEntity } from '@common/database/base/base.entity'
import { ChatRunStatusEnum } from '../enum/chat-run-status.enum'

@Entity('gpt_chat_messages')
@Index(['userId', 'createdAt'])
export class GptChatMessage extends BaseEntity {
    @ApiProperty()
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string

    @ApiProperty()
    @Column({ type: 'text' })
    prompt: string

    @ApiProperty({ required: false })
    @Column({ type: 'text', nullable: true })
    response?: string

    @ApiProperty()
    @Column({ type: 'varchar', length: 64 })
    model: string

    @ApiProperty({ enum: ChatRunStatusEnum })
    @Column({
        type: 'enum',
        enum: ChatRunStatusEnum,
        default: ChatRunStatusEnum.PENDING,
    })
    status: ChatRunStatusEnum

    @ApiProperty({ required: false })
    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage?: string

    @ApiProperty()
    @Column({ name: 'prompt_tokens', type: 'int', default: 0 })
    promptTokens: number

    @ApiProperty()
    @Column({ name: 'completion_tokens', type: 'int', default: 0 })
    completionTokens: number

    @ApiProperty()
    @Column({ name: 'total_tokens', type: 'int', default: 0 })
    totalTokens: number

    @ApiProperty({ required: false })
    @Column({ name: 'raw_payload', type: 'jsonb', nullable: true })
    rawPayload?: Record<string, any>
}
