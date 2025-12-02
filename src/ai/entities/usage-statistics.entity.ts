import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { BaseEntity } from '@common/database/base/base.entity'
import { User } from '../../system/user/entity/user.entity'

@Entity('usage_statistics')
export class UsageStatistics extends BaseEntity {
    @ApiProperty()
    @Column({ name: 'user_id' })
    userId: string

    @ManyToOne(() => User, (user) => user.usageStatistics)
    @JoinColumn({ name: 'user_id' })
    user: User

    @ApiProperty()
    @Column()
    model: string

    @ApiProperty()
    @Column()
    prompt: string

    @ApiProperty()
    @Column({ name: 'output_text', nullable: true })
    outputText: string

    @ApiProperty()
    @Column({ name: 'input_tokens', default: 0 })
    inputTokens: number

    @ApiProperty()
    @Column({ name: 'output_tokens', default: 0 })
    outputTokens: number
}
