import { BaseEntity } from '@common/database/base/base.entity'
import { Column, Entity } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

@Entity('chats')
export class Chat extends BaseEntity {
    @ApiProperty()
    @Column()
    name: string

    @ApiProperty()
    @Column({ type: 'bigint' })
    tg_id: number
}