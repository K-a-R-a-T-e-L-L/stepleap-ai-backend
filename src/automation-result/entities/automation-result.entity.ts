import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@common/database/base/base.entity'
import { AutomationRunLog } from '../../automation-run-log/entities/automation-run-log.entity'

@Entity('automation_result')
export class AutomationResult extends BaseEntity {
    @ApiProperty()
    @ManyToOne(() => AutomationRunLog, { eager: true })
    @JoinColumn({ name: 'run_log_id' })
    runLog: AutomationRunLog

    @ApiProperty()
    @Column({ name: 'run_log_id', type: 'uuid' })
    runLogId: string

    @ApiProperty()
    @Column({ name: 'output_url' })
    outputUrl: string

    @ApiPropertyOptional({ type: 'object', additionalProperties: true })
    @Column({ name: 'payload', type: 'jsonb', nullable: true })
    payload?: Record<string, any>

    @ApiHideProperty()
    @Column({ name: 'meta', type: 'jsonb', nullable: true })
    meta?: Record<string, any>
}
