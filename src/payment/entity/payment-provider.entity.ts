import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'

import { BaseEntity } from '@common/database/base/base.entity'

@Entity('payment_providers')
export class PaymentProvider extends BaseEntity {
    @ApiProperty()
    @Column()
    name: string

    @ApiProperty()
    @Column()
    code: string
}
