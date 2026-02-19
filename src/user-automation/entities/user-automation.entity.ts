import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { BaseEntity } from '@common/database/base/base.entity'
import { User } from '../../system/user/entity/user.entity'
import { AutomationTemplate } from '../../automation-template/entities/automation-template.entity'
import { AutomationRunLog } from '../../automation-run-log/entities/automation-run-log.entity'
import { TriggerTypeEnum } from '../enum/trigger-type.enum'

@Entity('user_automation')
export class UserAutomation extends BaseEntity {
    @ApiHideProperty()
    @ManyToOne(() => User, (user) => user.userAutomations, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User

    @ApiProperty()
    @Column({ name: 'user_id', type: 'uuid' })
    userId: string

    @ApiHideProperty()
    @ManyToOne(() => AutomationTemplate, (template) => template.userAutomations, { eager: true })
    @JoinColumn({ name: 'template_id' })
    template: AutomationTemplate

    @ApiProperty()
    @Column({ name: 'template_id', type: 'uuid' })
    templateId: string

    @ApiProperty()
    @Column({ name: 'trigger_type', type: 'enum', enum: TriggerTypeEnum })
    triggerType: TriggerTypeEnum

    @ApiProperty({ type: [String], required: false })
    @Column({ name: 'time_start', type: 'timestamptz', array: true, nullable: true })
    timeStart?: Date[]

    @ApiProperty({ type: 'object', additionalProperties: true })
    @Column({ type: 'jsonb', nullable: true })
    parameters?: Record<string, any>

    @ApiHideProperty()
    @OneToMany(() => AutomationRunLog, (runLog) => runLog.userAutomation)
    runLogs: AutomationRunLog[]
}
