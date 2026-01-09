import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, ManyToMany, OneToMany, OneToOne } from 'typeorm'
import { BaseEntity } from '@common/database/base/base.entity'
import { RolesEnum } from '../enum/roles.enum'
import { Subscription } from '../../../subscription/entity/subscription.entity'
import { Survey } from '../../../survey/entity/survey.entity'
import { Group } from '../../../group/entity/group.entity'
import { UsageStatistics } from '../../../ai/entities/usage-statistics.entity'
import { Conversation } from '../../../conversation/entities/conversation.entity'
import { Pipeline } from 'src/pipeline/entities/pipeline.entity'

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

    // Inverse side must point to the relation property on Subscription
    @OneToOne(() => Subscription, (subscription) => subscription.user)
    subscription: Subscription

    @OneToOne(() => Survey, (survey) => survey.user)
    survey: Survey

    @OneToMany(() => UsageStatistics, (usageStatistics) => usageStatistics.user)
    usageStatistics: UsageStatistics

    @OneToMany(() => Conversation, (conversation) => conversation.user)
    conversations: Conversation[]

    @OneToMany(() => Pipeline, (pipeline) => pipeline.user)
    pipelines: Pipeline[]
}
