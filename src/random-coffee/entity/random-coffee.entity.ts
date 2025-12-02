import { BaseEntity } from '@common/database/base/base.entity'
import { Column, Entity } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('random_coffees')
export class RandomCoffee extends BaseEntity {
    @ApiProperty()
    @Column({ name: 'user_ids', type: 'text', array: true, default: [], nullable: true })
    userIds: string[]
}