import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { BaseEntity } from '@common/database/base/base.entity'
import { AutomationRunLog } from '../../automation-run-log/entities/automation-run-log.entity'
import { UsageLineItem } from './usage-line-item.entity'

@Entity('usage_event')
export class UsageEvent extends BaseEntity {
    @ApiHideProperty()
    @ManyToOne(() => AutomationRunLog, { eager: true, nullable: true })
    @JoinColumn({ name: 'run_log_id' })
    runLog?: AutomationRunLog

    @ApiProperty({ required: false })
    @Column({ name: 'run_log_id', type: 'uuid', nullable: true })
    runLogId?: string

    @ApiProperty({ required: false })
    @Column({ name: 'idempotency_key', nullable: true, unique: true })
    idempotencyKey?: string

    @ApiPropertyOptional({ type: 'object', additionalProperties: true })
    @Column({ name: 'raw_payload', type: 'jsonb', nullable: true })
    rawPayload?: Record<string, any>

    @ApiHideProperty()
    @OneToMany(() => UsageLineItem, (lineItem) => lineItem.usageEvent)
    lineItems: UsageLineItem[]
}
