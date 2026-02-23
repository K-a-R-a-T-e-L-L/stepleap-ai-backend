import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { BaseEntity } from '@common/database/base/base.entity'
import { UserAutomation } from '../../user-automation/entities/user-automation.entity'
import { RunLogStatusEnum } from '../enum/run-log-status.enum'
import { AutomationRunStepEvent } from './automation-run-step-event.entity'

@Entity('automation_run_log')
export class AutomationRunLog extends BaseEntity {
    @ApiHideProperty()
    @ManyToOne(() => UserAutomation, (userAutomation) => userAutomation.runLogs, { eager: true })
    @JoinColumn({ name: 'user_automation_id' })
    userAutomation: UserAutomation

    @ApiProperty()
    @Column({ name: 'user_automation_id', type: 'uuid' })
    userAutomationId: string

    @ApiProperty()
    @Column({ type: 'enum', enum: RunLogStatusEnum, default: RunLogStatusEnum.PENDING })
    status: RunLogStatusEnum

    @ApiProperty({ required: false })
    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage?: string

    @ApiProperty()
    @Column({ name: 'start_time', type: 'timestamptz', default: () => 'NOW()' })
    startTime: Date

    @ApiProperty({ required: false })
    @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
    endTime?: Date

    @ApiProperty({ required: false })
    @Column({ name: 'n8n_execution_id', nullable: true })
    n8nExecutionId?: string

    @ApiProperty({ type: [AutomationRunStepEvent], required: false })
    @OneToMany(() => AutomationRunStepEvent, (stepEvent) => stepEvent.runLog, { eager: true })
    stepEvents?: AutomationRunStepEvent[]
}
