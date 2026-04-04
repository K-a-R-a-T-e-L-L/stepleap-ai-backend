import { BaseEntity } from '@common/database/base/base.entity'
import { Column, Entity, Index } from 'typeorm'

@Entity('career_proofs')
@Index('IDX_career_proofs_telegram_id', ['telegramId'])
export class CareerProofEntity extends BaseEntity {
    @Column({ name: 'telegram_id', type: 'bigint', nullable: false })
    telegramId: number

    @Column({ type: 'varchar', length: 255, nullable: false })
    title: string

    @Column({ type: 'varchar', length: 32, nullable: false, default: 'draft' })
    status: string

    @Column({ type: 'text', nullable: true })
    content: string | null
}
