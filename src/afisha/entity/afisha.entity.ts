import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from '@common/database/base/base.entity'
import { ApiProperty } from '@nestjs/swagger'
import { File } from '../../file/entity/file.entity'

@Entity('afisha')
export class Afisha extends BaseEntity {
    @ApiProperty()
    @Column({ name: 'preview_file_id', nullable: true })
    previewFileId: string

    @ApiProperty({ type: () => File })
    @ManyToOne(() => File, { eager: true })
    @JoinColumn({ name: 'preview_file_id' })
    previewFile: File

    @ApiProperty()
    @Column()
    title: string

    @ApiProperty()
    @Column()
    description: string

    @ApiProperty()
    @Column({ name: 'date_at' })
    dateAt: Date

    @ApiProperty()
    @Column({ nullable: true })
    place?: string

    @ApiProperty()
    @Column({ name: 'place_url', nullable: true })
    placeUrl?: string
}
