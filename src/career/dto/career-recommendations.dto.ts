import { ApiProperty } from '@nestjs/swagger'

export class CareerTrackDto {
    @ApiProperty({ example: 'marketing-analytics' })
    id: string

    @ApiProperty({ example: 'Аналитика маркетинга' })
    title: string

    @ApiProperty({ example: 83 })
    score: number

    @ApiProperty({ example: 'первые задачи через 3-4 недели' })
    eta: string

    @ApiProperty({ example: 'AI-скоринг: совпало hard skills: 3, релевантный опыт: 1.' })
    reason: string
}

export class CareerSkillScoreDto {
    @ApiProperty({ example: 'React' })
    name: string

    @ApiProperty({ example: 82 })
    score: number

    @ApiProperty({ example: 'Подтверждено навыками и опытом из профиля.' })
    reason: string
}

export class CareerRecommendationsResponseDto {
    @ApiProperty({ type: [CareerTrackDto] })
    tracks: CareerTrackDto[]

    @ApiProperty({ example: 'Marketing analyst intern' })
    nearestRole: string

    @ApiProperty({ example: 70 })
    profileReadyPercent: number

    @ApiProperty({ type: [CareerSkillScoreDto] })
    hardSkills: CareerSkillScoreDto[]

    @ApiProperty({ type: [CareerSkillScoreDto] })
    softSkills: CareerSkillScoreDto[]

    @ApiProperty({ example: true })
    llmUsed: boolean

    @ApiProperty({ example: '429 status code (no body)', nullable: true })
    llmError: string | null
}
