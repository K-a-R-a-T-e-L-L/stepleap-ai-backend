import { BaseEntity } from '@common/database/base/base.entity'
import { Column, Entity, Index } from 'typeorm'

@Entity('career_episode_progress')
@Index('IDX_career_episode_progress_telegram_episode', ['telegramId', 'episodeId'], { unique: true })
@Index('IDX_career_episode_progress_telegram_track', ['telegramId', 'trackId'])
export class CareerEpisodeProgressEntity extends BaseEntity {
    @Column({ name: 'telegram_id', type: 'bigint', nullable: false })
    telegramId: number

    @Column({ name: 'episode_id', type: 'varchar', length: 128, nullable: false })
    episodeId: string

    @Column({ name: 'track_id', type: 'varchar', length: 96, nullable: true })
    trackId: string | null

    @Column({ name: 'completed_at', type: 'timestamptz', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    completedAt: Date
}
