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

    @ApiProperty()
    @Column({ default: 10000 })
    tokens: number

    @ApiProperty()
    @Column({ name: 'is_view_webinars' })
    isViewWebinars: boolean

    @ApiProperty()
    @Column({ name: 'is_view_affiche' })
    isViewAffiche: boolean

    @ApiProperty()
    @Column({ name: 'is_view_chats' })
    isViewChats: boolean

    @ApiProperty()
    @Column({ name: 'is_random_coffee' })
    isRandomCoffee: boolean
}
