import { BaseEntity } from '@common/database/base/base.entity'
import { Column, Entity, Index } from 'typeorm'

@Entity('career_profiles')
@Index('IDX_career_profiles_telegram_id', ['telegramId'], { unique: true })
export class CareerProfileEntity extends BaseEntity {
    @Column({ name: 'telegram_id', type: 'bigint', nullable: false })
    telegramId: number

    @Column({ type: 'varchar', length: 32, nullable: true })
    mode: string | null

    @Column({ type: 'varchar', length: 16, nullable: true })
    age: string | null

    @Column({ type: 'varchar', length: 32, nullable: true })
    education: string | null

    @Column({ type: 'varchar', length: 32, nullable: true })
    goal: string | null

    @Column({ type: 'varchar', length: 32, nullable: true })
    preference: string | null

    @Column({ name: 'team_style', type: 'varchar', length: 32, nullable: true })
    teamStyle: string | null

    @Column({ type: 'varchar', length: 32, nullable: true })
    rhythm: string | null

    @Column({ name: 'hard_skills', type: 'text', nullable: true })
    hardSkills: string | null

    @Column({ name: 'soft_skills', type: 'text', nullable: true })
    softSkills: string | null

    @Column({ type: 'text', nullable: true })
    experience: string | null

    @Column({ name: 'target_vacancy', type: 'text', nullable: true })
    targetVacancy: string | null
}
