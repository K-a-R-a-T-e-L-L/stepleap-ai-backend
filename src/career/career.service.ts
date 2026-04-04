import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { createHash } from 'crypto'
import OpenAI from 'openai'
import { Repository } from 'typeorm'
import { CareerEpisodeDto, CompleteCareerEpisodeDto, CompleteCareerEpisodeResponseDto } from './dto/career-episode.dto'
import { CareerProfileDto } from './dto/career-profile.dto'
import { CareerProfileStateDto } from './dto/career-profile-state.dto'
import { CareerRecommendationsResponseDto } from './dto/career-recommendations.dto'
import { CareerProofDto } from './dto/career-proof.dto'
import { CareerVacancyDto } from './dto/career-vacancy.dto'
import { CareerEpisodeCacheEntity } from './entity/career-episode-cache.entity'
import { CareerEpisodeProgressEntity } from './entity/career-episode-progress.entity'
import { CareerProfileEntity } from './entity/career-profile.entity'
import { CareerProofEntity } from './entity/career-proof.entity'
import { CareerRecommendationEntity } from './entity/career-recommendation.entity'
import { CareerVacancyCacheEntity } from './entity/career-vacancy-cache.entity'
import { CareerVacancyNormalizedEntity } from './entity/career-vacancy-normalized.entity'
import { CareerVacancyRawEntity } from './entity/career-vacancy-raw.entity'

type Track = { id: string; title: string; score: number; eta: string; reason: string; role: string }
type SkillScore = { name: string; score: number; reason: string }
type LlmResult<T> = { data: T | null; error: string | null }
type EpisodeCheckpoint = {
    id: string
    title: string
    duration: string
    status: string
    description: string
    nextAction: string
    details: string
    impact: string
    order: number
    trackId: string
    isCurrent: boolean
    completed: boolean
}
type RemoteOkJob = {
    id?: number | string
    date?: string
    company?: string
    position?: string
    tags?: string[]
    description?: string
    location?: string
    apply_url?: string
    url?: string
    salary_min?: number | string
    salary_max?: number | string
}

type NormalizedVacancy = {
    title: string | null
    company: string | null
    location: string | null
    country_hint: string | null
    employment_type: string | null
    work_mode: string | null
    seniority: string | null
    salary_from: number | null
    salary_to: number | null
    currency: string | null
    skills: string[]
    tags: string[]
    description_clean: string
    summary: string
    junior_friendly: boolean
    low_quality: boolean
    apply_url: string | null
    source_url: string | null
    published_at: string | null
}

@Injectable()
export class CareerService {
    private readonly logger = new Logger(CareerService.name)
    private readonly llmProvider: 'ollama' | 'gemini' | 'groq' | 'none'
    private readonly llmModel: string
    private readonly remoteOkUrl: string
    private readonly remoteOkSyncLimit: number
    private readonly syncIntervalMs: number
    private readonly llmNormalizeLimit: number
    private readonly llm: OpenAI | null

    private lastVacancySyncAt = 0
    private syncPromise: Promise<void> | null = null

    private readonly defaultProfile: CareerProfileDto = {
        mode: 'deep',
        age: '',
        education: null,
        goal: null,
        preference: null,
        teamStyle: null,
        rhythm: null,
        hardSkills: '',
        softSkills: '',
        experience: '',
        targetVacancy: null,
    }

    constructor(
        @InjectRepository(CareerProfileEntity)
        private readonly profileRepository: Repository<CareerProfileEntity>,
        @InjectRepository(CareerVacancyRawEntity)
        private readonly vacancyRawRepository: Repository<CareerVacancyRawEntity>,
        @InjectRepository(CareerVacancyNormalizedEntity)
        private readonly vacancyNormalizedRepository: Repository<CareerVacancyNormalizedEntity>,
        @InjectRepository(CareerProofEntity)
        private readonly proofRepository: Repository<CareerProofEntity>,
        @InjectRepository(CareerRecommendationEntity)
        private readonly recommendationRepository: Repository<CareerRecommendationEntity>,
        @InjectRepository(CareerEpisodeCacheEntity)
        private readonly episodeCacheRepository: Repository<CareerEpisodeCacheEntity>,
        @InjectRepository(CareerEpisodeProgressEntity)
        private readonly episodeProgressRepository: Repository<CareerEpisodeProgressEntity>,
        @InjectRepository(CareerVacancyCacheEntity)
        private readonly vacancyCacheRepository: Repository<CareerVacancyCacheEntity>,
        private readonly configService: ConfigService,
    ) {
        this.remoteOkUrl = this.configService.get<string>('REMOTE_OK_API_URL') || 'https://remoteok.com/api'
        this.remoteOkSyncLimit = Number(this.configService.get<string>('REMOTE_OK_SYNC_LIMIT') || 25)
        this.syncIntervalMs = Number(this.configService.get<string>('REMOTE_OK_SYNC_INTERVAL_MS') || 1000 * 60 * 15)
        this.llmNormalizeLimit = Number(this.configService.get<string>('LLM_NORMALIZE_LIMIT') || 3)
        const llmTimeoutMs = Number(this.configService.get<string>('LLM_TIMEOUT_MS') || 120000)

        const ollamaBaseUrlRaw = this.configService.get<string>('OLLAMA_BASE_URL') || ''
        const ollamaModel = this.configService.get<string>('OLLAMA_MODEL') || 'qwen3:0.6b'
        const ollamaApiKey = this.configService.get<string>('OLLAMA_API_KEY') || 'ollama'
        const groqApiKey = this.configService.get<string>('GROQ_API_KEY')
        const geminiApiKey = this.configService.get<string>('GEMINI_API_KEY')
        const ollamaBaseUrl = ollamaBaseUrlRaw.replace(/\/+$/, '').replace(/\/api$/, '')

        if (ollamaBaseUrl) {
            this.llmProvider = 'ollama'
            this.llmModel = ollamaModel
            this.llm = new OpenAI({
                apiKey: ollamaApiKey,
                baseURL: `${ollamaBaseUrl}/v1`,
                maxRetries: 0,
                timeout: llmTimeoutMs,
            })
        } else if (geminiApiKey) {
            this.llmProvider = 'gemini'
            this.llmModel = this.configService.get<string>('GEMINI_MODEL') || 'models/gemini-2.5-flash'
            this.llm = new OpenAI({
                apiKey: geminiApiKey,
                baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
                maxRetries: 0,
                timeout: llmTimeoutMs,
            })
        } else if (groqApiKey) {
            this.llmProvider = 'groq'
            this.llmModel = this.configService.get<string>('GROQ_MODEL') || 'llama-3.3-70b-versatile'
            this.llm = new OpenAI({
                apiKey: groqApiKey,
                baseURL: 'https://api.groq.com/openai/v1',
                maxRetries: 0,
                timeout: llmTimeoutMs,
            })
        } else {
            this.llmProvider = 'none'
            this.llmModel = 'none'
            this.llm = null
        }

        this.logger.log(`LLM provider: ${this.llmProvider}, model: ${this.llmModel}`)
    }

    private tokenize(text: string | null | undefined) {
        return (text || '')
            .toLowerCase()
            .split(/[^a-zа-я0-9+#-]+/i)
            .map((token) => token.trim())
            .filter(Boolean)
    }

    private overlap(tokens: string[], tags: readonly string[]) {
        const set = new Set(tokens)
        return tags.reduce((acc, item) => (set.has(item.toLowerCase()) ? acc + 1 : acc), 0)
    }

    private score(value: number) {
        return Math.max(0, Math.min(100, Math.round(value)))
    }

    private prettySkillName(raw: string) {
        const normalized = raw.trim().toLowerCase()
        const map: Record<string, string> = {
            'c++': 'C++',
            'c#': 'C#',
            'js': 'JavaScript',
            'ts': 'TypeScript',
            'react': 'React',
            'next': 'Next.js',
            'sql': 'SQL',
            'html': 'HTML',
            'css': 'CSS',
        }
        return map[normalized] || raw.trim()
    }

    private getLlmErrorMessage(error: unknown) {
        const e = error as { status?: number; code?: string; message?: string }
        if (e?.status || e?.code || e?.message) {
            return `${e.status || ''} ${e.code || ''} ${e.message || ''}`.trim()
        }
        return 'LLM request failed'
    }

    private mapProfileEntityToDto(entity: CareerProfileEntity): CareerProfileDto {
        return {
            mode: entity.mode || 'deep',
            age: entity.age || '',
            education: entity.education || null,
            goal: entity.goal || null,
            preference: entity.preference || null,
            teamStyle: entity.teamStyle || null,
            rhythm: entity.rhythm || null,
            hardSkills: entity.hardSkills || '',
            softSkills: entity.softSkills || '',
            experience: entity.experience || '',
            targetVacancy: entity.targetVacancy || null,
        }
    }

    private calculateProfileReadyPercent(profile: CareerProfileDto) {
        const keys: (keyof CareerProfileDto)[] = [
            'age',
            'education',
            'goal',
            'preference',
            'teamStyle',
            'rhythm',
            'hardSkills',
            'softSkills',
            'experience',
            'targetVacancy',
        ]
        const fields = keys.map((key) => profile[key])
        const filled = fields.filter((item) => (typeof item === 'string' ? item.trim() : item)).length
        return Math.round((filled / fields.length) * 100)
    }

    private buildTracks(profile: CareerProfileDto): Track[] {
        const hard = this.tokenize(profile.hardSkills)
        const soft = this.tokenize(profile.softSkills)
        const exp = this.tokenize(profile.experience)

        const catalog = [
            {
                id: 'frontend-engineer',
                title: 'Frontend Developer',
                role: 'Junior Frontend Developer',
                eta: 'первые отклики через 1-2 недели',
                focus: 'tech',
                goals: ['part-time', 'internship', 'first-job'],
                hardTags: ['js', 'javascript', 'ts', 'typescript', 'react', 'next', 'html', 'css', 'frontend'],
                softTags: ['коммуникация', 'самоорганизация', 'системность'],
                expTags: ['проект', 'коммерческих', 'поддерживал', 'разработка'],
            },
            {
                id: 'backend-developer',
                title: 'Backend Developer',
                role: 'Junior Backend Developer',
                eta: 'первые задачи через 2-4 недели',
                focus: 'tech',
                goals: ['internship', 'first-job'],
                hardTags: ['node', 'nestjs', 'express', 'python', 'java', 'go', 'sql', 'postgres', 'api', 'backend'],
                softTags: ['системность', 'внимательность'],
                expTags: ['api', 'сервер', 'база', 'интеграция'],
            },
            {
                id: 'qa-junior',
                title: 'QA Engineer',
                role: 'Junior QA Engineer',
                eta: 'первые задачи через 2-3 недели',
                focus: 'tech',
                goals: ['internship', 'first-job'],
                hardTags: ['test', 'testing', 'jira', 'postman', 'api'],
                softTags: ['внимательность', 'системность'],
                expTags: ['тестирование', 'ошибки'],
            },
            {
                id: 'smm-marketing',
                title: 'SMM Specialist',
                role: 'Junior SMM Specialist',
                eta: 'быстрый старт за 1-2 недели',
                focus: 'people',
                goals: ['part-time', 'internship', 'first-job'],
                hardTags: ['контент', 'smm', 'копирайтинг'],
                softTags: ['коммуникация', 'креатив'],
                expTags: ['блог', 'пост'],
            },
        ]

        const ranked = catalog
            .map((track) => {
                const hardMatch = this.overlap(hard, track.hardTags)
                const softMatch = this.overlap(soft, track.softTags)
                const expMatch = this.overlap(exp, track.expTags)
                const focusBoost = profile.preference === track.focus ? 10 : 0
                const goalBoost = profile.goal && (track.goals as string[]).includes(profile.goal) ? 14 : 0
                const hasHardData = hard.length > 0 ? 1 : 0
                const raw = 18 + hardMatch * 15 + softMatch * 8 + expMatch * 10 + focusBoost + goalBoost + hasHardData * 6

                const reasonParts: string[] = []
                if (hardMatch) reasonParts.push(`hard=${hardMatch}`)
                if (softMatch) reasonParts.push(`soft=${softMatch}`)
                if (expMatch) reasonParts.push(`experience=${expMatch}`)

                return {
                    id: track.id,
                    title: track.title,
                    role: track.role,
                    eta: track.eta,
                    score: this.score(Math.min(99, raw)),
                    reason: reasonParts.length ? `AI-скоринг: ${reasonParts.join(', ')}.` : 'AI-скоринг: добавь больше релевантных данных.',
                }
            })
            .sort((a, b) => b.score - a.score)
        const selected = ranked.filter((item) => item.score >= 42).slice(0, 3)
        return selected.length ? selected : ranked.slice(0, 1)
    }

    private toTrackId(input: string) {
        return input
            .toLowerCase()
            .replace(/[^a-z0-9а-я]+/gi, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 48) || 'track'
    }

    private validateAiTracks(payload: unknown): Track[] | null {
        if (!payload || typeof payload !== 'object') return null
        const rawTracks = (payload as { tracks?: unknown }).tracks
        if (!Array.isArray(rawTracks)) return null
        const roleKeywords = [
            'developer',
            'engineer',
            'analyst',
            'manager',
            'specialist',
            'разработчик',
            'инженер',
            'аналитик',
            'менеджер',
            'специалист',
        ]
        const nonRoleStarts = ['разработка', 'интеграция', 'оптимизация', 'создание', 'улучшение']

        const parsed = rawTracks
            .slice(0, 3)
            .map((item) => {
                if (!item || typeof item !== 'object') return null
                const raw = item as { title?: unknown; score?: unknown; eta?: unknown; reason?: unknown; role?: unknown }
                if (typeof raw.title !== 'string') return null
                const score = Number(raw.score)
                if (!Number.isFinite(score)) return null
                const title = raw.title.trim()
                const lowerTitle = title.toLowerCase()
                const hasRoleKeyword = roleKeywords.some((keyword) => lowerTitle.includes(keyword))
                const startsLikeTask = nonRoleStarts.some((prefix) => lowerTitle.startsWith(prefix))
                const tooLong = title.length > 48 || title.split(/\s+/).length > 5
                if (!title || startsLikeTask || !hasRoleKeyword || tooLong) return null

                return {
                    id: this.toTrackId(title),
                    title,
                    score: this.score(score),
                    eta: typeof raw.eta === 'string' && raw.eta.trim() ? raw.eta.trim() : '2-4 недели',
                    reason: typeof raw.reason === 'string' && raw.reason.trim() ? raw.reason.trim() : 'Сгенерировано на основе профиля.',
                    role: typeof raw.role === 'string' && raw.role.trim() ? raw.role.trim() : title,
                } satisfies Track
            })
            .filter((item): item is Track => Boolean(item))

        if (parsed.length < 1 || parsed.length > 3) return null
        return parsed.sort((a, b) => b.score - a.score)
    }

    private async deepseekTracks(profile: CareerProfileDto): Promise<LlmResult<Track[]>> {
        if (!this.llm) return { data: null, error: 'LLM provider is not configured' }

        try {
            const completion = await this.llm.chat.completions.create({
                model: this.llmModel,
                temperature: 0.2,
                max_tokens: 300,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content:
                            'Ты карьерный ассистент. Верни строго JSON: { "tracks": [ { "title": "...", "score": 0-100, "eta": "...", "reason": "...", "role": "..." } ] }. От 1 до 3 треков. title и role должны быть в формате названия вакансии/роли (например "Backend Developer", "Middle Frontend Developer", "Data Analyst"). Нельзя возвращать названия задач типа "Разработка...", "Интеграция...", "Оптимизация...". title должен быть коротким: максимум 5 слов и 48 символов.',
                    },
                    {
                        role: 'user',
                        content: JSON.stringify({
                            profile,
                            constraints: {
                                language: 'ru',
                                tracksCount: '1..3',
                                roleFormat: 'короткая ближайшая роль',
                            },
                        }),
                    },
                ],
            })

            const content = completion.choices?.[0]?.message?.content
            if (!content) return { data: null, error: 'Empty LLM response' }
            return { data: this.validateAiTracks(JSON.parse(content)), error: null }
        } catch (error) {
            const message = this.getLlmErrorMessage(error)
            this.logger.warn(`LLM tracks failed: ${message}`)
            return { data: null, error: message }
        }
    }

    private fallbackSkills(profile: CareerProfileDto, tracks: Track[]) {
        const ready = this.calculateProfileReadyPercent(profile)
        const hard = this.tokenize(profile.hardSkills)
        const soft = this.tokenize(profile.softSkills)
        const exp = this.tokenize(profile.experience)

        const hardPool = [
            { name: 'JavaScript / TypeScript', probes: ['js', 'javascript', 'ts', 'typescript'] },
            { name: 'React / UI', probes: ['react', 'next', 'html', 'css', 'frontend'] },
            { name: 'Инженерные инструменты', probes: ['git', 'jira', 'api', 'postman'] },
            { name: 'Аналитика', probes: ['sql', 'excel', 'метрики'] },
        ]
        const softPool = [
            { name: 'Коммуникация', probes: ['коммуникация', 'переговоры'] },
            { name: 'Целеустремленность', probes: ['целеустремленность', 'инициативность'] },
            { name: 'Системность', probes: ['системность', 'логика'] },
            { name: 'Самоорганизация', probes: ['самоорганизация', 'дисциплина'] },
        ]

        const makeItems = (pool: { name: string; probes: string[] }[], source: string[]) =>
            pool
                .map((item) => ({
                    name: item.name,
                    score: this.score(24 + this.overlap(source, item.probes) * 26 + this.overlap(exp, item.probes) * 12 + ready * 0.25),
                    reason: 'Оценка по профилю и опыту пользователя.',
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 3)

        const hardFromProfile = [...new Set(hard)]
            .filter((token) => token.length > 1)
            .slice(0, 3)
            .map((token, index) => ({
                name: this.prettySkillName(token),
                score: this.score(52 + ready * 0.22 - index * 6),
                reason: 'Навык взят напрямую из профиля пользователя.',
            }))

        const hardSkills = hardFromProfile.length > 0 ? hardFromProfile : makeItems(hardPool, hard)
        const softSkills = makeItems(softPool, soft)

        if (hard.length === 0) {
            return {
                hardSkills: [
                    {
                        name: 'Недостаточно hard skills',
                        score: 0,
                        reason: 'Добавь конкретные технологии и инструменты (например: React, SQL, Figma).',
                    },
                    {
                        name: 'Недостаточно hard skills',
                        score: 0,
                        reason: 'Добавь стек, с которым реально работал в проектах.',
                    },
                    {
                        name: 'Недостаточно hard skills',
                        score: 0,
                        reason: 'Без хард-стека AI не сможет точно оценить карьерный трек.',
                    },
                ],
                softSkills,
            }
        }

        if (tracks[0]?.id === 'frontend-engineer' && hardSkills.every((item) => !/React|JavaScript|TypeScript|C\+\+|C#/i.test(item.name))) {
            hardSkills[0] = { name: 'React / UI', score: this.score(70 + ready * 0.15), reason: 'Frontend-трек подтвержден стеком профиля.' }
        }

        return { hardSkills, softSkills }
    }

    private validateAiSkills(payload: unknown): { hardSkills: SkillScore[]; softSkills: SkillScore[] } | null {
        if (!payload || typeof payload !== 'object') return null
        const input = payload as { hardSkills?: unknown; softSkills?: unknown }
        const parse = (value: unknown) => {
            if (!Array.isArray(value)) return null
            const parsed = value.slice(0, 3).map((item) => {
                if (!item || typeof item !== 'object') return null
                const raw = item as { name?: unknown; score?: unknown; reason?: unknown }
                const numeric = Number(raw.score)
                if (typeof raw.name !== 'string' || !Number.isFinite(numeric)) return null
                return { name: raw.name, score: this.score(numeric), reason: typeof raw.reason === 'string' ? raw.reason : 'Оценка AI.' }
            }).filter(Boolean) as SkillScore[]
            return parsed.length === 3 ? parsed : null
        }
        const hardSkills = parse(input.hardSkills)
        const softSkills = parse(input.softSkills)
        if (!hardSkills || !softSkills) return null
        return { hardSkills, softSkills }
    }

    private areAiSkillsRelevant(profile: CareerProfileDto, skills: { hardSkills: SkillScore[]; softSkills: SkillScore[] }) {
        const profileTokens = new Set([
            ...this.tokenize(profile.hardSkills),
            ...this.tokenize(profile.softSkills),
            ...this.tokenize(profile.experience),
        ])
        if (profileTokens.size === 0) return false

        const scoreRelevance = (name: string) => {
            const tokens = this.tokenize(name)
            return tokens.some((token) => profileTokens.has(token))
        }

        const hardRelevant = skills.hardSkills.filter((item) => scoreRelevance(item.name)).length
        const softRelevant = skills.softSkills.filter((item) => scoreRelevance(item.name)).length
        return hardRelevant >= 1 || softRelevant >= 1
    }

    private async deepseekSkills(profile: CareerProfileDto, tracks: Track[]): Promise<LlmResult<{ hardSkills: SkillScore[]; softSkills: SkillScore[] }>> {
        if (!this.llm) return { data: null, error: 'LLM provider is not configured' }
        try {
            const completion = await this.llm.chat.completions.create({
                model: this.llmModel,
                temperature: 0.2,
                max_tokens: 300,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: 'Верни строго JSON c hardSkills и softSkills по 3 элемента. Каждый элемент: name, score(0-100), reason. Язык: русский.' },
                    { role: 'user', content: JSON.stringify({ profile, topTrack: tracks[0] }) },
                ],
            })
            const content = completion.choices?.[0]?.message?.content
            if (!content) return { data: null, error: 'Empty LLM response' }
            const validated = this.validateAiSkills(JSON.parse(content))
            if (!validated) return { data: null, error: 'Invalid LLM skills schema' }
            if (!this.areAiSkillsRelevant(profile, validated)) {
                return { data: null, error: 'LLM skills are not relevant to profile' }
            }
            return { data: validated, error: null }
        } catch (error) {
            const message = this.getLlmErrorMessage(error)
            this.logger.warn(`LLM skills failed: ${message}`)
            return { data: null, error: message }
        }
    }

    private recommendationProfileHash(profile: CareerProfileDto) {
        return createHash('sha256')
            .update(
                JSON.stringify({
                    mode: profile.mode || null,
                    age: profile.age || '',
                    education: profile.education || null,
                    goal: profile.goal || null,
                    preference: profile.preference || null,
                    teamStyle: profile.teamStyle || null,
                    rhythm: profile.rhythm || null,
                    hardSkills: profile.hardSkills || '',
                    softSkills: profile.softSkills || '',
                    experience: profile.experience || '',
                    targetVacancy: profile.targetVacancy || '',
                }),
            )
            .digest('hex')
    }

    async getRecommendations(
        profile: CareerProfileDto,
        useLlm = true,
        telegramId?: number,
    ): Promise<CareerRecommendationsResponseDto> {
        const profileHash = this.recommendationProfileHash(profile)

        if (telegramId) {
            const cached = await this.recommendationRepository.findOne({
                where: { telegramId, profileHash },
            })
            if (cached?.payload) {
                return cached.payload as unknown as CareerRecommendationsResponseDto
            }
        }

        const fallbackTracks = this.buildTracks(profile)
        const tracksResult = useLlm ? await this.deepseekTracks(profile) : { data: null, error: null }
        const tracks = tracksResult.data || fallbackTracks
        const fallback = this.fallbackSkills(profile, tracks)
        const skillsResult = useLlm ? await this.deepseekSkills(profile, tracks) : { data: null, error: null }
        const llmUsed = useLlm && Boolean(tracksResult.data || skillsResult.data)
        const llmError = useLlm ? tracksResult.error || skillsResult.error : null

        const result: CareerRecommendationsResponseDto = {
            tracks,
            nearestRole: tracks[0]?.role || 'Junior trainee',
            profileReadyPercent: this.calculateProfileReadyPercent(profile),
            hardSkills: skillsResult.data?.hardSkills || fallback.hardSkills,
            softSkills: skillsResult.data?.softSkills || fallback.softSkills,
            llmUsed,
            llmError,
        }

        if (telegramId) {
            const entity =
                (await this.recommendationRepository.findOne({ where: { telegramId } })) ||
                this.recommendationRepository.create({ telegramId })
            entity.profileHash = profileHash
            entity.payload = result as unknown as Record<string, unknown>
            await this.recommendationRepository.save(entity)
        }

        return result
    }
    private profileKeyByTelegramId(telegramId: number) {
        return String(telegramId)
    }

    async getProfile(telegramId: number): Promise<CareerProfileStateDto> {
        const key = this.profileKeyByTelegramId(telegramId)
        const entity = await this.profileRepository.findOne({ where: { telegramId } })

        if (!entity) {
            return {
                profileKey: key,
                profile: { ...this.defaultProfile },
                updatedAt: new Date().toISOString(),
            }
        }

        return {
            profileKey: key,
            profile: this.mapProfileEntityToDto(entity),
            updatedAt: entity.updatedAt.toISOString(),
        }
    }

    async saveProfile(profile: CareerProfileDto, telegramId: number): Promise<CareerProfileStateDto> {
        let entity = await this.profileRepository.findOne({ where: { telegramId } })

        if (!entity) {
            entity = this.profileRepository.create({ telegramId })
        }

        entity.mode = 'deep'
        entity.age = profile.age
        entity.education = profile.education
        entity.goal = profile.goal
        entity.preference = profile.preference
        entity.teamStyle = profile.teamStyle
        entity.rhythm = profile.rhythm
        entity.hardSkills = profile.hardSkills
        entity.softSkills = profile.softSkills
        entity.experience = profile.experience
        entity.targetVacancy = profile.targetVacancy

        const saved = await this.profileRepository.save(entity)

        return {
            profileKey: this.profileKeyByTelegramId(telegramId),
            profile: this.mapProfileEntityToDto(saved),
            updatedAt: saved.updatedAt.toISOString(),
        }
    }

    private toNumber(value: unknown): number | null {
        if (value === null || value === undefined || value === '') return null
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
    }

    private parsePublishedAt(value: string | null | undefined): Date | null {
        if (!value) return null
        const parsed = new Date(value)
        return Number.isNaN(parsed.getTime()) ? null : parsed
    }

    private fallbackNormalize(job: RemoteOkJob): NormalizedVacancy {
        const description = job.description || ''
        const tags = Array.isArray(job.tags) ? job.tags.filter(Boolean).map((item) => String(item)) : []
        const skills = tags.slice(0, 10)
        const juniorFriendly = tags.some((tag) => ['junior', 'intern', 'entry', 'trainee'].includes(tag.toLowerCase())) || /junior|intern|entry|trainee/i.test(description)

        return {
            title: job.position || null,
            company: job.company || null,
            location: job.location || null,
            country_hint: job.location || null,
            employment_type: 'unknown',
            work_mode: 'remote',
            seniority: juniorFriendly ? 'junior' : 'unknown',
            salary_from: this.toNumber(job.salary_min),
            salary_to: this.toNumber(job.salary_max),
            currency: null,
            skills,
            tags,
            description_clean: description ? description.replace(/<[^>]+>/g, ' ').slice(0, 700) : '',
            summary: `Вакансия ${job.position || 'без названия'} в ${job.company || 'неизвестной компании'}.`,
            junior_friendly: juniorFriendly,
            low_quality: false,
            apply_url: job.apply_url || null,
            source_url: job.url || null,
            published_at: job.date || null,
        }
    }

    private async deepseekNormalize(job: RemoteOkJob): Promise<NormalizedVacancy | null> {
        if (!this.llm) return null

        try {
            const completion = await this.llm.chat.completions.create({
                model: this.llmModel,
                temperature: 0.2,
                max_tokens: 650,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: 'Ты нормализатор вакансий. Верни JSON по схеме без markdown.' },
                    {
                        role: 'user',
                        content: JSON.stringify({
                            raw: job,
                            schema: {
                                title: 'string|null', company: 'string|null', location: 'string|null', country_hint: 'string|null',
                                employment_type: 'full-time|part-time|contract|internship|freelance|unknown|null', work_mode: 'remote|hybrid|onsite|unknown|null',
                                seniority: 'intern|junior|middle|senior|lead|unknown|null', salary_from: 'number|null', salary_to: 'number|null',
                                currency: 'string|null', skills: ['string'], tags: ['string'], description_clean: 'string', summary: 'string',
                                junior_friendly: 'boolean', low_quality: 'boolean', apply_url: 'string|null', source_url: 'string|null', published_at: 'string|null',
                            },
                        }),
                    },
                ],
            })

            const content = completion.choices?.[0]?.message?.content
            if (!content) return null
            const parsed = JSON.parse(content) as Partial<NormalizedVacancy>

            return {
                title: parsed.title ?? null,
                company: parsed.company ?? null,
                location: parsed.location ?? null,
                country_hint: parsed.country_hint ?? null,
                employment_type: parsed.employment_type ?? 'unknown',
                work_mode: parsed.work_mode ?? 'unknown',
                seniority: parsed.seniority ?? 'unknown',
                salary_from: this.toNumber(parsed.salary_from),
                salary_to: this.toNumber(parsed.salary_to),
                currency: parsed.currency ?? null,
                skills: Array.isArray(parsed.skills) ? parsed.skills.map(String) : [],
                tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : [],
                description_clean: typeof parsed.description_clean === 'string' ? parsed.description_clean : '',
                summary: typeof parsed.summary === 'string' ? parsed.summary : '',
                junior_friendly: Boolean(parsed.junior_friendly),
                low_quality: Boolean(parsed.low_quality),
                apply_url: parsed.apply_url ?? job.apply_url ?? null,
                source_url: parsed.source_url ?? job.url ?? null,
                published_at: parsed.published_at ?? job.date ?? null,
            }
        } catch (error) {
            this.logger.warn(`LLM normalize failed: ${(error as Error).message}`)
            return null
        }
    }

    private async normalizeVacancy(job: RemoteOkJob): Promise<NormalizedVacancy> {
        const aiNormalized = await this.deepseekNormalize(job)
        return aiNormalized || this.fallbackNormalize(job)
    }

    private async syncRemoteOkFeed(force = false) {
        const now = Date.now()
        if (!force && now - this.lastVacancySyncAt < this.syncIntervalMs) return
        if (this.syncPromise) return this.syncPromise

        this.syncPromise = (async () => {
            const response = await fetch(this.remoteOkUrl)
            if (!response.ok) throw new Error(`RemoteOK feed failed: ${response.status}`)

            const rawData = (await response.json()) as unknown[]
            const jobs = rawData.slice(1, this.remoteOkSyncLimit + 1) as RemoteOkJob[]

            for (const [index, job] of jobs.entries()) {
                const externalId = String(job.id || job.url || `${job.company}-${job.position}`)
                const fetchedAt = new Date()

                let rawEntity = await this.vacancyRawRepository.findOne({ where: { source: 'remoteok', externalId } })
                const prevPayload = rawEntity?.payload ? JSON.stringify(rawEntity.payload) : null
                const nextPayload = JSON.stringify(job)
                const payloadChanged = prevPayload !== nextPayload

                if (!rawEntity) {
                    rawEntity = this.vacancyRawRepository.create({ source: 'remoteok', externalId, payload: job, fetchedAt })
                } else {
                    rawEntity.payload = job
                    rawEntity.fetchedAt = fetchedAt
                }
                await this.vacancyRawRepository.save(rawEntity)

                let normalizedEntity = await this.vacancyNormalizedRepository.findOne({ where: { source: 'remoteok', externalId } })
                if (!payloadChanged && normalizedEntity) {
                    continue
                }

                const normalized = this.llm && index < this.llmNormalizeLimit ? await this.normalizeVacancy(job) : this.fallbackNormalize(job)
                if (!normalizedEntity) {
                    normalizedEntity = this.vacancyNormalizedRepository.create({ source: 'remoteok', externalId })
                }

                normalizedEntity.title = normalized.title
                normalizedEntity.company = normalized.company
                normalizedEntity.location = normalized.location
                normalizedEntity.countryHint = normalized.country_hint
                normalizedEntity.employmentType = normalized.employment_type
                normalizedEntity.workMode = normalized.work_mode
                normalizedEntity.seniority = normalized.seniority
                normalizedEntity.salaryFrom = normalized.salary_from
                normalizedEntity.salaryTo = normalized.salary_to
                normalizedEntity.currency = normalized.currency
                normalizedEntity.skills = normalized.skills
                normalizedEntity.tags = normalized.tags
                normalizedEntity.descriptionClean = normalized.description_clean
                normalizedEntity.summary = normalized.summary
                normalizedEntity.juniorFriendly = normalized.junior_friendly
                normalizedEntity.lowQuality = normalized.low_quality
                normalizedEntity.applyUrl = normalized.apply_url
                normalizedEntity.sourceUrl = normalized.source_url
                normalizedEntity.publishedAt = this.parsePublishedAt(normalized.published_at)
                normalizedEntity.normalizedAt = new Date()
                await this.vacancyNormalizedRepository.save(normalizedEntity)
            }

            this.lastVacancySyncAt = Date.now()
        })()

        try { await this.syncPromise } finally { this.syncPromise = null }
    }

    private startBackgroundVacancySync() {
        void this.syncRemoteOkFeed(false).catch((error) => {
            this.logger.warn(`Background vacancy sync failed: ${(error as Error).message}`)
        })
    }

    async syncVacanciesNow() {
        await this.syncRemoteOkFeed(true)
        return { syncedAt: new Date().toISOString() }
    }
    private buildVacancyTokenSet(vacancy: CareerVacancyNormalizedEntity) {
        return this.tokenize([
            vacancy.title || '',
            vacancy.summary || '',
            vacancy.descriptionClean || '',
            ...(vacancy.skills || []),
            ...(vacancy.tags || []),
        ].join(' '))
    }

    private formatMode(workMode: string | null, employmentType: string | null) {
        const modeMap: Record<string, string> = {
            remote: 'удаленно',
            hybrid: 'гибрид',
            onsite: 'офис',
            unknown: '',
        }
        const typeMap: Record<string, string> = {
            'full-time': 'полный день',
            'part-time': 'частичная занятость',
            contract: 'контракт',
            internship: 'стажировка',
            freelance: 'фриланс',
            unknown: '',
        }
        const modePart = modeMap[(workMode || 'unknown').toLowerCase()] || ''
        const typePart = typeMap[(employmentType || 'unknown').toLowerCase()] || ''
        const parts = [modePart, typePart].filter(Boolean)
        return parts.length ? parts.join(' · ') : 'формат не указан'
    }

    private computeVacancyMatch(profile: CareerProfileDto, vacancy: CareerVacancyNormalizedEntity, topTrackId: string) {
        const hardTokens = this.tokenize(profile.hardSkills)
        const softTokens = this.tokenize(profile.softSkills)
        const expTokens = this.tokenize(profile.experience)
        const vacancyTokens = this.buildVacancyTokenSet(vacancy)

        const hardMatch = this.overlap(hardTokens, vacancyTokens)
        const softMatch = this.overlap(softTokens, vacancyTokens)
        const expMatch = this.overlap(expTokens, vacancyTokens)

        const trackKeywords: Record<string, string[]> = {
            'frontend-engineer': ['frontend', 'react', 'javascript', 'typescript', 'next', 'html', 'css'],
            'qa-junior': ['qa', 'testing', 'test', 'postman', 'jira', 'bug'],
            'smm-marketing': ['smm', 'content', 'social', 'marketing', 'copywriting'],
        }
        const trackBoost = this.overlap(vacancyTokens, trackKeywords[topTrackId] || []) * 5
        const goalBoost = profile.goal === 'first-job' && vacancy.juniorFriendly ? 10 : 0
        const preferenceBoost = profile.preference === 'tech' ? this.overlap(vacancyTokens, ['frontend', 'api', 'javascript', 'react', 'qa']) * 3 : 0

        const base = 6
        const score = this.score(Math.min(98, base + hardMatch * 12 + softMatch * 7 + expMatch * 9 + trackBoost + goalBoost + preferenceBoost))

        const userSet = new Set([...hardTokens, ...softTokens, ...expTokens])
        const genericWords = new Set(['consultant', 'manager', 'specialist', 'engineer', 'developer', 'intern', 'junior', 'middle', 'senior'])
        const gap =
            (vacancy.skills || [])
                .map((skill) => skill.trim())
                .find((skill) => {
                    const token = skill.toLowerCase()
                    return token.length > 2 && !userSet.has(token) && !genericWords.has(token)
                }) ||
            'ключевой технический стек вакансии'

        const reasonParts: string[] = []
        if (hardMatch > 0) reasonParts.push('совпадает стек и инструменты')
        if (softMatch > 0) reasonParts.push('учтены soft skills из профиля')
        if (expMatch > 0) reasonParts.push('релевантный опыт подтвержден')
        if (trackBoost > 0) reasonParts.push('вакансия близка к выбранному треку')
        if (goalBoost > 0) reasonParts.push('роль подходит для старта карьеры')

        return {
            score,
            reason: reasonParts.length ? reasonParts.join(', ') : 'совпадений пока мало: сначала нужно закрыть 1-2 ключевых навыка',
            gap,
        }
    }

    private buildNextSteps(vacancy: CareerVacancyNormalizedEntity, score: number) {
        const focusSkill = vacancy.skills?.[0] || 'ключевой навык вакансии'
        const sprintDuration = score >= 75 ? '2-3 дня' : score >= 45 ? '5-7 дней' : '7-10 дней'
        const deliverable =
            vacancy.workMode === 'remote'
                ? 'сделать мини-кейс и оформить краткое описание решения'
                : 'собрать кейс + подготовить устную презентацию'
        const action3 =
            score >= 60
                ? 'откликнуться на 2-3 релевантные вакансии и в сопроводительном кратко описать свой кейс'
                : 'пройти еще один эпизод по недостающему навыку и после этого вернуться к откликам'

        return `1) Спринт по навыку «${focusSkill}» (${sprintDuration}) 2) ${deliverable} 3) ${action3}`
    }

    async getVacancies(trackId: string | undefined, telegramId: number): Promise<CareerVacancyDto[]> {
        const targetVacancyCount = 5
        const profile = (await this.getProfile(telegramId)).profile
        const recommendations = await this.getRecommendations(profile, false, telegramId)
        const profileHash = this.recommendationProfileHash(profile)
        const primaryTrack = trackId || recommendations.tracks[0]?.id || 'frontend-engineer'
        const cached = await this.vacancyCacheRepository.findOne({
            where: { telegramId, profileHash, trackId: primaryTrack },
        })
        if (cached?.payload) {
            const cachedPayload = cached.payload as unknown as CareerVacancyDto[]
            if (Array.isArray(cachedPayload) && cachedPayload.length >= targetVacancyCount) {
                return cachedPayload
            }
        }

        const normalizedCount = await this.vacancyNormalizedRepository.count({
            where: { source: 'remoteok', lowQuality: false },
        })
        if (normalizedCount === 0) {
            await this.syncRemoteOkFeed(false)
        } else {
            this.startBackgroundVacancySync()
        }

        const normalizedVacancies = await this.vacancyNormalizedRepository.find({
            where: { source: 'remoteok', lowQuality: false },
            order: { publishedAt: 'DESC', normalizedAt: 'DESC' },
            take: 80,
        })
        const vacancyPool = [...normalizedVacancies]
        if (vacancyPool.length < targetVacancyCount) {
            const fallbackVacancies = await this.vacancyNormalizedRepository.find({
                where: { source: 'remoteok' },
                order: { publishedAt: 'DESC', normalizedAt: 'DESC' },
                take: 120,
            })
            for (const vacancy of fallbackVacancies) {
                if (vacancyPool.some((item) => item.externalId === vacancy.externalId)) continue
                vacancyPool.push(vacancy)
                if (vacancyPool.length >= targetVacancyCount * 4) break
            }
        }

        const result = vacancyPool
            .map((vacancy) => ({ vacancy, match: this.computeVacancyMatch(profile, vacancy, primaryTrack) }))
            .sort((a, b) => b.match.score - a.match.score)
            .slice(0, targetVacancyCount)
            .map(({ vacancy, match }, index) => ({
                id: `${primaryTrack}-${vacancy.externalId}-${index}`,
                title: vacancy.title || `${recommendations.tracks[0]?.title || 'Роль'} · Intern`,
                mode: this.formatMode(vacancy.workMode, vacancy.employmentType),
                match: match.score,
                matchReason: match.reason,
                gap: `Не хватает: ${match.gap}`,
                plan: this.buildNextSteps(vacancy, match.score),
                sourceUrl: vacancy.sourceUrl,
                applyUrl: vacancy.applyUrl,
                sourceName: 'Remote OK',
            }))

        await this.vacancyCacheRepository.upsert(
            {
                telegramId,
                profileHash,
                trackId: primaryTrack,
                payload: result as unknown as Record<string, unknown>,
            },
            ['telegramId', 'profileHash', 'trackId'],
        )

        return result
    }

    private async ensureProofsSeeded(telegramId: number) {
        const count = await this.proofRepository.count({ where: { telegramId } })
        if (count > 0) return

        await this.proofRepository.save(this.proofRepository.create([
            { telegramId, title: 'Мини-кейс по брифу', status: 'draft', content: 'Черновик ответа по первому заданию.' },
            { telegramId, title: 'Разбор метрик и гипотез', status: 'ready', content: 'Базовый анализ CTR/конверсии.' },
        ]))
    }

    private async completedEpisodeSet(telegramId: number) {
        const [progress, proofs] = await Promise.all([
            this.episodeProgressRepository.find({ where: { telegramId } }),
            this.proofRepository.find({ where: { telegramId } }),
        ])
        const done = new Set<string>()
        for (const item of progress) {
            if (item.episodeId?.trim()) {
                done.add(item.episodeId.trim())
            }
        }
        // Backward compatibility: old builds stored episode completion in career_proofs content.
        for (const proof of proofs) {
            if (typeof proof.content === 'string' && proof.content.startsWith('episode:')) {
                const legacyEpisodeId = proof.content.replace('episode:', '').trim()
                if (legacyEpisodeId) done.add(legacyEpisodeId)
            }
        }
        return done
    }

    private goalLabel(goal: string | null | undefined) {
        if (goal === 'first-job') return 'первая работа'
        if (goal === 'internship') return 'стажировка'
        if (goal === 'part-time') return 'подработка'
        return 'целевая роль'
    }

    private validateAiCheckpoints(
        payload: unknown,
        targetTrack: string,
    ): EpisodeCheckpoint[] | null {
        if (!payload || typeof payload !== 'object') return null
        const checkpoints = (payload as { checkpoints?: unknown }).checkpoints
        if (!Array.isArray(checkpoints)) return null

        const parsed = checkpoints
            .slice(0, 7)
            .map((item, index) => {
                if (!item || typeof item !== 'object') return null
                const raw = item as {
                    title?: unknown
                    duration?: unknown
                    description?: unknown
                    nextAction?: unknown
                    details?: unknown
                    impact?: unknown
                }
                if (
                    typeof raw.title !== 'string' ||
                    typeof raw.duration !== 'string' ||
                    typeof raw.description !== 'string' ||
                    typeof raw.nextAction !== 'string' ||
                    typeof raw.details !== 'string' ||
                    typeof raw.impact !== 'string'
                ) {
                    return null
                }

                const slug = this.toTrackId(raw.title)
                return {
                    id: `${targetTrack}-${slug}-${index + 1}`,
                    title: raw.title.trim(),
                    duration: raw.duration.trim(),
                    status: 'доступно',
                    description: raw.description.trim(),
                    nextAction: raw.nextAction.trim(),
                    details: raw.details.trim(),
                    impact: raw.impact.trim(),
                    order: index + 1,
                    trackId: targetTrack,
                    isCurrent: false,
                    completed: false,
                } as EpisodeCheckpoint
            })
            .filter((item): item is EpisodeCheckpoint => Boolean(item))

        if (parsed.length < 3) return null
        return parsed
    }

    private async aiCheckpointPlan(
        targetTrack: string,
        targetTrackTitle: string,
        profile: CareerProfileDto,
        recommendations: CareerRecommendationsResponseDto,
    ): Promise<EpisodeCheckpoint[] | null> {
        if (!this.llm) return null
        try {
            const completion = await this.llm.chat.completions.create({
                model: this.llmModel,
                temperature: 0.2,
                max_tokens: 700,
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content:
                            'Сгенерируй персональный roadmap по треку. Верни JSON: { "checkpoints": [ { "title": "...", "duration": "...", "description": "...", "nextAction": "...", "details": "...", "impact": "..." } ] }. От 3 до 7 checkpoint, строгая хронология: первый checkpoint = текущий уровень, последний = выход на целевую роль/цель.',
                    },
                    {
                        role: 'user',
                        content: JSON.stringify({
                            trackId: targetTrack,
                            trackTitle: targetTrackTitle,
                            profile,
                            recommendations,
                            constraints: {
                                language: 'ru',
                                clarity: 'concrete actionable instructions',
                            },
                        }),
                    },
                ],
            })

            const content = completion.choices?.[0]?.message?.content
            if (!content) return null
            return this.validateAiCheckpoints(JSON.parse(content), targetTrack)
        } catch (error) {
            this.logger.warn(`LLM checkpoints failed: ${this.getLlmErrorMessage(error)}`)
            return null
        }
    }

    private fallbackCheckpointPlan(
        targetTrack: string,
        targetTrackTitle: string,
        topGaps: string[],
        profile: CareerProfileDto,
    ): EpisodeCheckpoint[] {
        const requestedVacancy = profile.targetVacancy?.trim()
        const goalLabel = this.goalLabel(profile.goal)
        const gapOne = topGaps[0] || 'базовые технологии трека'
        const gapTwo = topGaps[1] || 'практика по задачам вакансий'
        const plan = [
            {
                slug: 'entry',
                title: `Стартовая точка: ${targetTrackTitle}`,
                duration: '5-10 минут',
                description: 'Определи текущий уровень и зафиксируй, что уже умеешь.',
                nextAction: 'Сверь свои навыки с требованиями трека и запиши 3 сильные стороны.',
                details:
                    'Шаги: 1) выпиши уже знакомые технологии 2) выбери 1-2 пробела 3) зафиксируй фокус на текущую неделю.',
                impact: 'Понятная стартовая позиция и фокус обучения.',
            },
            {
                slug: 'tryout',
                title: `Try-Out: ${targetTrackTitle}`,
                duration: '15-25 минут',
                description: 'Мини-практика для проверки интереса и базовой готовности к треку.',
                nextAction: 'Выполни короткую задачу по треку и отметь выполнение.',
                details:
                    'Шаги: 1) выбери задачу на 20 минут 2) выполни без подсказок 3) зафиксируй, где были сложности.',
                impact: '+понимание текущего уровня и реального прогресса.',
            },
            {
                slug: 'gap-1',
                title: `Закрыть разрыв: ${gapOne}`,
                duration: '40-90 минут',
                description: `Целенаправленно подтяни навык «${gapOne}».`,
                nextAction: `Пройди учебный материал по «${gapOne}» и выполни 1 практическое упражнение.`,
                details:
                    `Шаги: 1) изучи базу по «${gapOne}» 2) сделай мини-задачу 3) повтори решение без подсказок.`,
                impact: '+рост релевантности к выбранному треку.',
            },
            {
                slug: 'gap-2',
                title: `Закрыть разрыв: ${gapTwo}`,
                duration: '60-120 минут',
                description: `Укрепи второй ключевой навык «${gapTwo}».`,
                nextAction: `Сделай прикладную задачу по «${gapTwo}» в формате мини-кейса.`,
                details:
                    `Шаги: 1) разберись в требованиях по «${gapTwo}» 2) собери рабочий пример 3) сравни с ожиданиями вакансий.`,
                impact: '+уверенность в реальных задачах по роли.',
            },
            {
                slug: 'goal',
                title: `Финиш: выход на цель (${goalLabel})`,
                duration: '20-40 минут',
                description: requestedVacancy
                    ? `Подготовься к отклику на «${requestedVacancy}».`
                    : 'Подготовься к первым откликам по выбранной роли.',
                nextAction: requestedVacancy
                    ? `Собери план отклика на «${requestedVacancy}» и отметь, что готов отправить резюме.`
                    : 'Выбери 3 релевантные вакансии и подготовь краткий план отклика.',
                details: requestedVacancy
                    ? `Шаги: 1) выпиши требования «${requestedVacancy}» 2) соотнеси их со своими навыками 3) подготовь текст отклика.`
                    : 'Шаги: 1) выбери 3 вакансии 2) адаптируй резюме под требования 3) подготовь короткий сопроводительный текст.',
                impact: 'Переход от обучения к реальным откликам.',
            },
        ]

        const desiredCount = Math.max(3, Math.min(6, 3 + Math.min(topGaps.length, 2)))
        const selected = plan.slice(0, desiredCount - 1).concat(plan[plan.length - 1])
        return selected.map((item, index) => ({
            id: `${targetTrack}-${item.slug}-${index + 1}`,
            title: item.title,
            duration: item.duration,
            status: 'доступно',
            description: item.description,
            nextAction: item.nextAction,
            details: item.details,
            impact: item.impact,
            order: index + 1,
            trackId: targetTrack,
            isCurrent: false,
            completed: false,
        }))
    }

    private readEpisodeCache(payload: Record<string, unknown> | null | undefined): EpisodeCheckpoint[] | null {
        if (!payload) return null
        const checkpoints = (payload as { checkpoints?: unknown }).checkpoints
        if (!Array.isArray(checkpoints)) return null

        const parsed = checkpoints
            .map((item) => {
                if (!item || typeof item !== 'object') return null
                const raw = item as Partial<EpisodeCheckpoint>
                if (
                    typeof raw.id !== 'string' ||
                    typeof raw.title !== 'string' ||
                    typeof raw.duration !== 'string' ||
                    typeof raw.description !== 'string' ||
                    typeof raw.nextAction !== 'string' ||
                    typeof raw.details !== 'string' ||
                    typeof raw.impact !== 'string' ||
                    typeof raw.order !== 'number' ||
                    typeof raw.trackId !== 'string'
                ) {
                    return null
                }
                return {
                    id: raw.id,
                    title: raw.title,
                    duration: raw.duration,
                    status: 'доступно',
                    description: raw.description,
                    nextAction: raw.nextAction,
                    details: raw.details,
                    impact: raw.impact,
                    order: raw.order,
                    trackId: raw.trackId,
                    isCurrent: false,
                    completed: false,
                } as EpisodeCheckpoint
            })
            .filter((item): item is EpisodeCheckpoint => Boolean(item))

        return parsed.length ? parsed.sort((a, b) => a.order - b.order) : null
    }

    async getEpisodes(trackId: string | undefined, telegramId: number): Promise<CareerEpisodeDto[]> {
        const profile = (await this.getProfile(telegramId)).profile
        const recommendations = await this.getRecommendations(profile, false, telegramId)
        const profileHash = this.recommendationProfileHash(profile)
        const targetTrack = trackId || recommendations.tracks[0]?.id || 'frontend-engineer'
        const targetTrackTitle = recommendations.tracks.find((item) => item.id === targetTrack)?.title || recommendations.tracks[0]?.title || 'базовый трек'
        const topGaps = (recommendations.hardSkills || [])
            .map((item) => item.name?.trim())
            .filter((item): item is string => Boolean(item))
            .slice(0, 3)
        const completed = await this.completedEpisodeSet(telegramId)
        const cached = await this.episodeCacheRepository.findOne({
            where: { telegramId, profileHash, trackId: targetTrack },
        })
        let checkpoints = this.readEpisodeCache(cached?.payload)
        if (!checkpoints) {
            checkpoints =
                (await this.aiCheckpointPlan(targetTrack, targetTrackTitle, profile, recommendations)) ||
                this.fallbackCheckpointPlan(targetTrack, targetTrackTitle, topGaps, profile)

            await this.episodeCacheRepository.upsert(
                {
                    telegramId,
                    profileHash,
                    trackId: targetTrack,
                    payload: { checkpoints } as unknown as Record<string, unknown>,
                },
                ['telegramId', 'profileHash', 'trackId'],
            )
        }
        const currentIndex = checkpoints.findIndex((item) => !completed.has(item.id))

        return checkpoints.map((item, index) => {
            const isCompleted = completed.has(item.id)
            const isCurrent = currentIndex === -1 ? index === checkpoints.length - 1 : index === currentIndex
            const status = isCompleted ? 'завершен' : isCurrent ? 'текущий' : 'доступно'

            return {
                ...item,
                status,
                completed: isCompleted,
                isCurrent,
            }
        })
    }

    async completeEpisode(payload: CompleteCareerEpisodeDto, telegramId: number): Promise<CompleteCareerEpisodeResponseDto> {
        const episodeId = payload.episodeId?.trim()
        const trackId = payload.trackId?.trim() || null
        if (!episodeId) {
            return { episodeId: '', completed: false, message: 'Не передан episodeId.' }
        }

        const [existingProgress, existingLegacyProof] = await Promise.all([
            this.episodeProgressRepository.findOne({ where: { telegramId, episodeId } }),
            this.proofRepository.findOne({ where: { telegramId, content: `episode:${episodeId}` } }),
        ])
        if (existingProgress || existingLegacyProof) {
            return { episodeId, completed: true, message: 'Эпизод уже отмечен как выполненный.' }
        }

        await this.episodeProgressRepository.save(this.episodeProgressRepository.create({
            telegramId,
            episodeId,
            trackId,
        }))
        await this.proofRepository.save(this.proofRepository.create({
            telegramId,
            title: `Эпизод выполнен: ${episodeId}`,
            status: 'ready',
            content: `episode:${episodeId}`,
        }))

        return { episodeId, completed: true, message: 'Эпизод отмечен как выполненный.' }
    }

    async getProofs(telegramId: number): Promise<CareerProofDto[]> {
        await this.ensureProofsSeeded(telegramId)
        const proofs = await this.proofRepository.find({ where: { telegramId }, order: { createdAt: 'ASC' } })
        return proofs.map((proof) => ({ id: proof.id, title: proof.title, status: proof.status }))
    }
}



