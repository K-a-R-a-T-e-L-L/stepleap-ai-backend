import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, Index } from 'typeorm'

import { BaseEntity } from '@common/database/base/base.entity'
import { ChatRunStatusEnum } from '../enum/chat-run-status.enum'

@Entity('sora_chat_runs')
@Index(['userId', 'createdAt'])
@Index(['status', 'updatedAt'])
export class SoraChatRun extends BaseEntity {
    @ApiProperty()
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string

    @ApiProperty({ required: false })
    @Column({ name: 'chat_dialog_id', type: 'uuid', nullable: true })
    chatDialogId?: string

    @ApiProperty()
    @Column({ type: 'text' })
    prompt: string

    @ApiProperty()
    @Column({ type: 'int' })
    seconds: number

    @ApiProperty()
    @Column({ type: 'varchar', length: 32 })
    size: string

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
    @Column({ name: 'openai_video_id', type: 'varchar', length: 128, nullable: true })
    openaiVideoId?: string

    @ApiProperty()
    @Column({ type: 'int', default: 0 })
    progress: number

    @ApiProperty({ required: false })
    @Column({ name: 'output_url', type: 'text', nullable: true })
    outputUrl?: string

    @ApiProperty({ required: false })
    @Column({ name: 'file_id', type: 'uuid', nullable: true })
    fileId?: string

    @ApiProperty({ required: false })
    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage?: string

    @ApiProperty()
    @Column({ name: 'usage_recorded', type: 'boolean', default: false })
    usageRecorded: boolean

    @ApiProperty({ required: false })
    @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
    startedAt?: Date

    @ApiProperty({ required: false })
    @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
    finishedAt?: Date

    @ApiProperty()
    @Column({ name: 'poll_attempts', type: 'int', default: 0 })
    pollAttempts: number

    @ApiProperty({ required: false })
    @Column({ name: 'last_polled_at', type: 'timestamptz', nullable: true })
    lastPolledAt?: Date

    @ApiProperty({ required: false })
    @Column({ name: 'raw_payload', type: 'jsonb', nullable: true })
    rawPayload?: Record<string, any>
}
