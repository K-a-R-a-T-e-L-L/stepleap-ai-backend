import { BaseEntity } from '@common/database/base/base.entity'
import { Column, Entity, Index } from 'typeorm'

@Entity('career_vacancies_normalized')
@Index('IDX_career_vacancies_normalized_source_external_id', ['source', 'externalId'], {
    unique: true,
})
@Index('IDX_career_vacancies_normalized_published_at', ['publishedAt'])
export class CareerVacancyNormalizedEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 32, nullable: false })
    source: string

    @Column({ name: 'external_id', type: 'varchar', length: 128, nullable: false })
    externalId: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    title: string | null

    @Column({ type: 'varchar', length: 255, nullable: true })
    company: string | null

    @Column({ type: 'varchar', length: 255, nullable: true })
    location: string | null

    @Column({ name: 'country_hint', type: 'varchar', length: 128, nullable: true })
    countryHint: string | null

    @Column({ name: 'employment_type', type: 'varchar', length: 32, nullable: true })
    employmentType: string | null

    @Column({ name: 'work_mode', type: 'varchar', length: 32, nullable: true })
    workMode: string | null

    @Column({ type: 'varchar', length: 32, nullable: true })
    seniority: string | null

    @Column({ name: 'salary_from', type: 'numeric', nullable: true })
    salaryFrom: number | null

    @Column({ name: 'salary_to', type: 'numeric', nullable: true })
    salaryTo: number | null

    @Column({ type: 'varchar', length: 16, nullable: true })
    currency: string | null

    @Column({ type: 'jsonb', nullable: true })
    skills: string[] | null

    @Column({ type: 'jsonb', nullable: true })
    tags: string[] | null

    @Column({ name: 'description_clean', type: 'text', nullable: true })
    descriptionClean: string | null

    @Column({ type: 'text', nullable: true })
    summary: string | null

    @Column({ name: 'junior_friendly', type: 'boolean', default: false })
    juniorFriendly: boolean

    @Column({ name: 'low_quality', type: 'boolean', default: false })
    lowQuality: boolean

    @Column({ name: 'apply_url', type: 'text', nullable: true })
    applyUrl: string | null

    @Column({ name: 'source_url', type: 'text', nullable: true })
    sourceUrl: string | null

    @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
    publishedAt: Date | null

    @Column({ name: 'normalized_at', type: 'timestamptz', nullable: false })
    normalizedAt: Date
}
