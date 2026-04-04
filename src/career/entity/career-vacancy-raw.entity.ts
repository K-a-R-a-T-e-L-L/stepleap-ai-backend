import { BaseEntity } from '@common/database/base/base.entity'
import { Column, Entity, Index } from 'typeorm'

@Entity('career_vacancies_raw')
@Index('IDX_career_vacancies_raw_source_external_id', ['source', 'externalId'], {
    unique: true,
})
export class CareerVacancyRawEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 32, nullable: false })
    source: string

    @Column({ name: 'external_id', type: 'varchar', length: 128, nullable: false })
    externalId: string

    @Column({ type: 'jsonb', nullable: false })
    payload: unknown

    @Column({ name: 'fetched_at', type: 'timestamptz', nullable: false })
    fetchedAt: Date
}
