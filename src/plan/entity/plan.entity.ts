import { BaseEntity } from '@common/database/base/base.entity'
import { Column, Entity } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('plans')
export class Plan extends BaseEntity {
    @ApiProperty()
    @Column()
    name: string

    @ApiProperty()
    @Column()
    period: number

    @ApiProperty()
    @Column()
    amount: number

    // limits are handled via plan_limit + meters
}
