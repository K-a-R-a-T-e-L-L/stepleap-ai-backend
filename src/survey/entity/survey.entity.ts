import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { BaseEntity } from '@common/database/base/base.entity'
import { ApiProperty } from '@nestjs/swagger'
import { User } from '../../system/user/entity/user.entity'
import { File } from '../../file/entity/file.entity'

@Entity('surveys')
export class Survey extends BaseEntity {
    @ApiProperty({ type: () => User })
    @OneToOne(() => User, (user) => user.survey, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'user_id' }) // references User.uuid by default
    user: User

    @ApiProperty()
    @Column({ name: 'user_id' })
    userId: string

    @ApiProperty()
    @Column({ name: 'first_name' })
    firstName: string

    @ApiProperty()
    @Column({ name: 'last_name' })
    lastName: string

    @ApiProperty({ type: () => File })
    @OneToOne(() => File, { eager: true })
    @JoinColumn({ name: 'image_id' }) // references User.uuid by default
    image: File

    @ApiProperty()
    @Column({ name: 'image_id', type: 'uuid' })
    imageId: string

    @ApiProperty()
    @Column({ type: 'date', default: new Date() })
    dob: Date

    @ApiProperty()
    @Column()
    phone: string

    @ApiProperty()
    @Column()
    source: string

    @ApiProperty()
    @Column()
    goal: string

    @ApiProperty()
    @Column({ name: 'is_show_in_members_list' })
    isShowInMembersList: boolean
}
