import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@common/database/base/base.entity'
import { User } from '../../system/user/entity/user.entity'
import { Subscription } from '../../subscription/entity/subscription.entity'

@Entity('payments')
export class Payment extends BaseEntity {
    @ApiProperty()
    @Column()
    amount: number

    @ApiProperty()
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User

    @ApiProperty()
    @Column()
    status: string

    // provider removed (single provider)

    @ApiProperty()
    @Column({ name: 'payment_pay_id' })
    paymentPayId: string

    @ApiProperty()
    @Column({ name: 'payment_link' })
    paymentLink: string

    @ApiProperty()
    @ManyToOne(() => Subscription)
    @JoinColumn({ name: 'subscription_id' })
    subscription: Subscription
}
