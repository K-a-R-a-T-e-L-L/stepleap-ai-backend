import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { PipelineStep } from './pipeline-step.entity'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { BaseEntity } from '@common/database/base/base.entity'
import { User } from 'src/system/user/entity/user.entity'

@Entity('pipeline')
export class Pipeline extends BaseEntity {
    @ApiPropertyOptional()
    @Column({ default: '' })
    name?: string

    @ApiProperty({ type: () => [PipelineStep] })
    @OneToMany(() => PipelineStep, (pipelineStep) => pipelineStep.pipeline, {
        eager: true,
        cascade: true,
        orphanedRowAction: 'delete',
    })
    steps: PipelineStep[]

    @ManyToOne(() => User, (user) => user.pipelines)
    user: User
}
