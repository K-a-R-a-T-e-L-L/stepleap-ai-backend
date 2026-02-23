import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Column, Entity, OneToMany } from 'typeorm'

import { BaseEntity } from '@common/database/base/base.entity'
import { UserAutomation } from '../../user-automation/entities/user-automation.entity'
import { AutomationTemplateStep } from './automation-template-step.entity'

@Entity('automation_template')
export class AutomationTemplate extends BaseEntity {
    @ApiProperty()
    @Column()
    name: string

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    description?: string

    @ApiProperty()
    @Column({ name: 'n8n_id' })
    n8nId: string

    @ApiProperty({ type: 'object', additionalProperties: true })
    @Column({ type: 'jsonb', nullable: true })
    params?: Record<string, any>

    @ApiPropertyOptional({ type: [String] })
    @Column({ name: 'required_meters', type: 'varchar', array: true, nullable: true })
    requiredMeters?: string[]

    @ApiPropertyOptional({ type: 'object', additionalProperties: { type: 'number' } })
    @Column({ name: 'max_units_per_run', type: 'jsonb', nullable: true })
    maxUnitsPerRun?: Record<string, number>

    @ApiPropertyOptional({ type: [AutomationTemplateStep] })
    @OneToMany(() => AutomationTemplateStep, (step) => step.template, { eager: true, cascade: true })
    steps?: AutomationTemplateStep[]

    @ApiHideProperty()
    @OneToMany(() => UserAutomation, (userAutomation) => userAutomation.template)
    userAutomations: UserAutomation[]
}
