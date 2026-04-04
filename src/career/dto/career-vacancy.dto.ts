import { ApiProperty } from '@nestjs/swagger'

export class CareerVacancyDto {
    @ApiProperty({ example: 'marketing-analytics-1' })
    id: string

    @ApiProperty({ example: 'Аналитика маркетинга · Intern' })
    title: string

    @ApiProperty({ example: 'гибрид · стажировка' })
    mode: string

    @ApiProperty({ example: 78 })
    match: number

    @ApiProperty({ example: 'совпадают навыки по аналитике и отчетности' })
    matchReason: string

    @ApiProperty({ example: 'пройти sprint по метрикам и обновить профиль' })
    gap: string

    @ApiProperty({ example: '1) эпизод 2) мини-кейс 3) отклик' })
    plan: string

    @ApiProperty({ example: 'https://remoteok.com/remote-jobs/...' })
    sourceUrl: string | null

    @ApiProperty({ example: 'https://company.com/careers/...' })
    applyUrl: string | null

    @ApiProperty({ example: 'Remote OK' })
    sourceName: string
}
