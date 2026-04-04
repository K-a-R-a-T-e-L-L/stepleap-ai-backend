import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString } from 'class-validator'

export class CareerProfileDto {
    @ApiProperty({ example: 'deep', nullable: true })
    @IsOptional()
    @IsString()
    @IsIn(['deep'])
    mode: string | null

    @ApiProperty({ example: '27' })
    @IsString()
    age: string

    @ApiProperty({ example: 'vuz', nullable: true })
    @IsOptional()
    @IsString()
    education: string | null

    @ApiProperty({ example: 'internship', nullable: true })
    @IsOptional()
    @IsString()
    @IsIn(['part-time', 'internship', 'first-job'])
    goal: string | null

    @ApiProperty({ example: 'data', nullable: true })
    @IsOptional()
    @IsString()
    @IsIn(['people', 'data', 'tech'])
    preference: string | null

    @ApiProperty({ example: 'team', nullable: true })
    @IsOptional()
    @IsString()
    @IsIn(['team', 'solo'])
    teamStyle: string | null

    @ApiProperty({ example: 'dynamic', nullable: true })
    @IsOptional()
    @IsString()
    @IsIn(['stable', 'dynamic'])
    rhythm: string | null

    @ApiProperty({ example: 'sql, excel, figma' })
    @IsString()
    hardSkills: string

    @ApiProperty({ example: 'коммуникация, системность' })
    @IsString()
    softSkills: string

    @ApiProperty({ example: 'учебные проекты, подработка' })
    @IsString()
    experience: string

    @ApiProperty({ example: 'Junior Frontend Developer', nullable: true })
    @IsOptional()
    @IsString()
    targetVacancy: string | null
}
