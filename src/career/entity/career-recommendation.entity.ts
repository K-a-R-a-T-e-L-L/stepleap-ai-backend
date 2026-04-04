import { BaseEntity } from '@common/database/base/base.entity'
import { Column, Entity, Index } from 'typeorm'

@Entity('career_recommendations')
@Index('IDX_career_recommendations_telegram_id', ['telegramId'], { unique: true })
@Index('IDX_career_recommendations_profile_hash', ['profileHash'])
export class CareerRecommendationEntity extends BaseEntity {
    @Column({ name: 'telegram_id', type: 'bigint', nullable: false })
    telegramId: number

    @Column({ name: 'profile_hash', type: 'varchar', length: 128, nullable: false })
    profileHash: string

    @Column({ name: 'payload', type: 'jsonb', nullable: false })
    payload: Record<string, unknown>
}

