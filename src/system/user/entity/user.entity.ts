import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Column, Entity, ManyToMany, OneToMany, OneToOne } from 'typeorm'
import { BaseEntity } from '@common/database/base/base.entity'
import { RolesEnum } from '../enum/roles.enum'

@Entity('users')
export class User extends BaseEntity {
    @ApiProperty()
    @Column({ name: 'telegram_id', type: 'bigint', nullable: false, unique: true })
    telegramId: number

    @ApiProperty()
    @Column({ name: 'telegram_username', nullable: true })
    telegramUsername?: string

    @ApiProperty()
    @Column({ name: 'telegram_first_name', nullable: false })
    telegramFirstName: string

    @ApiProperty()
    @Column({ name: 'telegram_last_name', nullable: true })
    telegramLastName?: string

    @ApiProperty()
    @Column({ name: 'telegram_is_premium', nullable: true })
    telegramIsPremium?: boolean

    @ApiProperty()
    @Column({ name: 'telegram_language_code', nullable: true })
    telegramLanguageCode?: string

    @Column({ type: 'enum', enum: RolesEnum, default: RolesEnum.USER })
    role: RolesEnum
}
