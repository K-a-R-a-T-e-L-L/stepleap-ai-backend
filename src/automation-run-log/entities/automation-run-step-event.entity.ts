import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@common/database/base/base.entity'
import { AutomationTemplateStep } from '../../automation-template/entities/automation-template-step.entity'
import { AutomationRunLog } from './automation-run-log.entity'
import { RunStepStatusEnum } from '../enum/run-step-status.enum'

@Entity('automation_run_step_event')
@Index(['runLogId', 'createdAt'])
@Index(['runLogId', 'seq'], { unique: true })
@Index(['idempotencyKey'], { unique: true })
export class AutomationRunStepEvent extends BaseEntity {
    @ApiHideProperty()
    @ManyToOne(() => AutomationRunLog, (runLog) => runLog.stepEvents, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'run_log_id' })
    runLog: AutomationRunLog

    @ApiProperty()
    @Column({ name: 'run_log_id', type: 'uuid' })
    runLogId: string

    @ApiHideProperty()
    @ManyToOne(() => AutomationTemplateStep, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'template_step_id' })
    templateStep?: AutomationTemplateStep

    @ApiPropertyOptional()
    @Column({ name: 'template_step_id', type: 'uuid', nullable: true })
    templateStepId?: string

    @ApiProperty()
    @Column({ name: 'step_code', type: 'varchar', length: 64 })
    stepCode: string

    @ApiPropertyOptional()
    @Column({ name: 'step_title', type: 'varchar', length: 128, nullable: true })
    stepTitle?: string

    @ApiPropertyOptional()
    @Column({ name: 'step_title_ru', type: 'varchar', length: 128, nullable: true })
    stepTitleRu?: string

    @ApiPropertyOptional()
    @Column({ name: 'step_title_en', type: 'varchar', length: 128, nullable: true })
    stepTitleEn?: string

    @ApiProperty({ enum: RunStepStatusEnum })
    @Column({ type: 'enum', enum: RunStepStatusEnum })
    status: RunStepStatusEnum

    @ApiPropertyOptional()
    @Column({ name: 'message', type: 'text', nullable: true })
    message?: string

    @ApiPropertyOptional()
    @Column({ name: 'progress', type: 'int', nullable: true })
    progress?: number

    @ApiPropertyOptional()
    @Column({ name: 'seq', type: 'int', nullable: true })
    seq?: number

    @ApiPropertyOptional()
    @Column({ name: 'idempotency_key', type: 'varchar', length: 128, nullable: true })
    idempotencyKey?: string

    @ApiPropertyOptional({ type: 'object', additionalProperties: true })
    @Column({ name: 'raw_payload', type: 'jsonb', nullable: true })
    rawPayload?: Record<string, any>
}
