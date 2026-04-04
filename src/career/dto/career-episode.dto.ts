import { ApiProperty } from '@nestjs/swagger'

export class CareerEpisodeDto {
    @ApiProperty({ example: 'episode-tryout-1' })
    id: string

    @ApiProperty({ example: 'Try-Out: первый день в роли' })
    title: string

    @ApiProperty({ example: '7 минут' })
    duration: string

    @ApiProperty({ example: 'рекомендуется' })
    status: string

    @ApiProperty({ example: 'Мини-симуляция задач по выбранному направлению.' })
    description: string

    @ApiProperty({ example: 'Выполни мини-задачу и отметь эпизод завершенным.' })
    nextAction: string

    @ApiProperty({ example: 'Детальный план: 1) изучить основы 2) сделать мини-задачу 3) проверить результат.' })
    details: string

    @ApiProperty({ example: '+12% к match по релевантным вакансиям' })
    impact: string

    @ApiProperty({ example: 1 })
    order: number

    @ApiProperty({ example: 'frontend-engineer' })
    trackId: string

    @ApiProperty({ example: true })
    isCurrent: boolean

    @ApiProperty({ example: false })
    completed: boolean
}

export class CompleteCareerEpisodeDto {
    @ApiProperty({ example: 'marketing-analytics-episode-1' })
    episodeId: string

    @ApiProperty({ example: 'marketing-analytics', required: false, nullable: true })
    trackId?: string | null
}

export class CompleteCareerEpisodeResponseDto {
    @ApiProperty({ example: 'marketing-analytics-episode-1' })
    episodeId: string

    @ApiProperty({ example: true })
    completed: boolean

    @ApiProperty({ example: 'Эпизод отмечен как выполненный.' })
    message: string
}
