import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@common/database/base/base.entity'
import { AutomationTemplate } from './automation-template.entity'

@Entity('automation_template_step')
@Index(['templateId', 'code'], { unique: true })
@Index(['templateId', 'sortOrder'])
export class AutomationTemplateStep extends BaseEntity {
    @ApiHideProperty()
    @ManyToOne(() => AutomationTemplate, (template) => template.steps, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'template_id' })
    template: AutomationTemplate

    @ApiProperty()
    @Column({ name: 'template_id', type: 'uuid' })
    templateId: string

    @ApiProperty()
    @Column({ type: 'varchar', length: 64 })
    code: string

    @ApiProperty()
    @Column({ type: 'varchar', length: 128 })
    title: string

    @ApiPropertyOptional()
    @Column({ name: 'title_ru', type: 'varchar', length: 128, nullable: true })
    titleRu?: string

    @ApiPropertyOptional()
    @Column({ name: 'title_en', type: 'varchar', length: 128, nullable: true })
    titleEn?: string

    @ApiPropertyOptional()
    @Column({ type: 'varchar', length: 500, nullable: true })
    description?: string

    @ApiProperty()
    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder: number
}
