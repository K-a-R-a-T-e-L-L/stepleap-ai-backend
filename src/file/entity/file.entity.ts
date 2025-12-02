import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'

import { BaseEntity } from '@common/database/base/base.entity'
import { TypesEnum } from '../enum/types.enum'
import { Message } from '../../ai/entities/message.entity'

@Entity('files')
export class File extends BaseEntity {
    @ApiProperty()
    @Column({ type: 'enum', default: TypesEnum.FILE, enum: TypesEnum })
    type: TypesEnum

    @ApiProperty({ type: () => Message })
    @JoinColumn({ name: 'message_id' })
    @ManyToOne(() => Message, (message) => message.files)
    message: Message

    @ApiProperty()
    @Column({ name: 'message_id', nullable: true })
    messageId: string

    @ApiProperty()
    @Column({ name: 'original_url' })
    originalUrl: string

    @ApiProperty()
    @Column({ name: 'image_120_url', nullable: true })
    image120Url?: string

    @ApiProperty()
    @Column({ name: 'image_360_url', nullable: true })
    image360Url?: string

    @ApiProperty()
    @Column({ name: 'image_840_url', nullable: true })
    image840Url?: string

    @ApiProperty()
    @Column({ name: 'image_1080_url', nullable: true })
    image1080Url?: string

    @ApiProperty()
    @Column({ name: 'image_1320_url', nullable: true })
    image1320Url?: string
}
