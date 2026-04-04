import { BaseEntity } from '@common/database/base/base.entity'
import { Column, Entity, Index } from 'typeorm'

@Entity('career_vacancy_caches')
@Index('IDX_career_vacancy_caches_telegram_profile_track', ['telegramId', 'profileHash', 'trackId'], {
    unique: true,
})
export class CareerVacancyCacheEntity extends BaseEntity {
    @Column({ name: 'telegram_id', type: 'bigint', nullable: false })
    telegramId: number

    @Column({ name: 'profile_hash', type: 'varchar', length: 128, nullable: false })
    profileHash: string

    @Column({ name: 'track_id', type: 'varchar', length: 96, nullable: false })
    trackId: string

    @Column({ name: 'payload', type: 'jsonb', nullable: false })
    payload: Record<string, unknown>
}

