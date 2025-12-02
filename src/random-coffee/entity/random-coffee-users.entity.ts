import { BaseEntity } from '@common/database/base/base.entity'
import { Column, Entity } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('random_coffee_users')
export class RandomCoffeeUsers extends BaseEntity {
    @ApiProperty()
    @Column({ name: 'user_id_one' })
    userIdOne: string

    @ApiProperty()
    @Column({ name: 'user_id_two' })
    userIdTwo: string

    @ApiProperty()
    @Column({ name: 'randomCoffeeId' })
    randomCoffeeId: string
}