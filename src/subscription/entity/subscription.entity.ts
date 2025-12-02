import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, RelationId } from 'typeorm'
import { BaseEntity } from '@common/database/base/base.entity'
import { User } from '../../system/user/entity/user.entity'
import { Plan } from '../../plan/entity/plan.entity'
import { StatusesEnum } from '../enum/statuses.enum'
import { Exclude } from 'class-transformer'

@Entity('subscriptions')
export class Subscription extends BaseEntity {
    @ApiProperty()
    @Column({ type: 'enum', enum: StatusesEnum, default: StatusesEnum.PENDING })
    status: StatusesEnum

    // Owning side: holds user_id
    @OneToOne(() => User, (user) => user.subscription, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'user_id' }) // references User.uuid by default
    user: User

    @Column({ name: 'user_id' })
    @ApiProperty()
    userId: string
    // // If you want quick access to the FK value, use RelationId (no duplicate column definition)
    // @RelationId((s: Subscription) => s.user)
    // readonly userId: string

    @ApiProperty()
    @ManyToOne(() => Plan, { eager: true })
    @JoinColumn({ name: 'plan_id' })
    plan: Plan

    @Column({ name: 'plan_id', type: 'uuid' })
    planId: string

    @Exclude()
    @Column({ name: 'yookassa_payment_id' })
    yookassaPaymentId: string

    @Column({ name: 'next_pay_at', type: 'timestamp' })
    nextPayAt: Date

    @Column({ name: 'start_at', type: 'timestamp' })
    startAt: Date
}
