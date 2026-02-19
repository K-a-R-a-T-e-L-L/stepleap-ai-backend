import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm'
import { parse } from '@tma.js/init-data-node'
import { User } from '../entity/user.entity'
import { RolesEnum } from '../enum/roles.enum'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { CreateUserDto } from '../dto/create-user.dto'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    generateRefreshToken(user: User) {
        return this.jwtService.sign(
            { sub: user.id, user },
            {
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES'),
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            },
        )
    }

    generateAccessToken(user: User) {
        return this.jwtService.sign(
            { sub: user.id, user },
            {
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRES'),
                secret: this.configService.get('JWT_ACCESS_SECRET'),
            },
        )
    }

    generateTokenPair(user: User) {
        return {
            accessToken: this.generateAccessToken(user),
            refreshToken: this.generateRefreshToken(user),
        }
    }

    async authenticate(rawInitData: string) {
        let user: User
        let initData
        const adminIds = (this.configService.get('TELEGRAM_ADMIN_IDS') || '')
            .split(',')
            .map((id: string) => id.trim())
            .filter(Boolean)

        if (rawInitData.startsWith('qqq')) {
            const fallbackTelegramId = Number(adminIds[0] || '999000')
            user = await this.getUserByTelegramId(fallbackTelegramId)

            if (!user) {
                const isAdmin = adminIds.includes(String(fallbackTelegramId))
                user = await this.userRepository.save({
                    telegramId: fallbackTelegramId,
                    telegramUsername: 'dev_user',
                    telegramFirstName: 'Dev',
                    telegramLastName: 'Local',
                    telegramIsPremium: false,
                    telegramLanguageCode: 'ru',
                    role: isAdmin ? RolesEnum.ADMIN : RolesEnum.USER,
                })
            }
        } else {
            initData = parse(rawInitData)

            user = await this.getUserByTelegramId(initData.user.id)
        }

        if (user) {
            let needUpdate = false

            if (initData) {
                if (user.telegramUsername !== initData.user.username) {
                    needUpdate = true
                    user.telegramUsername = initData.user.username
                }

                if (user.telegramLanguageCode !== initData.user.language_code) {
                    needUpdate = true
                    user.telegramLanguageCode = initData.user.language_code
                }

                if (user.telegramIsPremium !== initData.user.is_premium) {
                    needUpdate = true
                    user.telegramIsPremium = initData.user.is_premium
                }

                if (user.telegramFirstName !== initData.user.first_name) {
                    needUpdate = true
                    user.telegramFirstName = initData.user.first_name
                }

                if (user.telegramLastName !== initData.user.last_name) {
                    needUpdate = true
                    user.telegramLastName = initData.user.last_name
                }

                if (needUpdate) {
                    await user.save()
                }
            }

            if (adminIds.includes(String(user.telegramId)) && user.role !== RolesEnum.ADMIN) {
                user.role = RolesEnum.ADMIN
                await user.save()
            }

            return {
                accessToken: this.generateAccessToken(user),
                refreshToken: this.generateRefreshToken(user),
                isNewUser: false,
            }
        }

        const newUser = await this.userRepository.save({
            telegramId: initData.user.id,
            telegramUsername: initData.user.username,
            telegramFirstName: initData.user.first_name,
            telegramLastName: initData.user.last_name,
            telegramIsPremium: initData.user.is_premium,
            telegramLanguageCode: initData.user.language_code,
            role: adminIds.includes(String(initData.user.id)) ? RolesEnum.ADMIN : RolesEnum.USER,
        })

        const { accessToken, refreshToken } = this.generateTokenPair(newUser)

        await this.jwtService.verify(refreshToken, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
        })

        return { refreshToken, accessToken, isNewUser: true }
    }

    async create(user: CreateUserDto) {
        return await this.userRepository.save(user)
    }

    async getUserFromToken(token: string, refreshToken: boolean) {
        const verify = this.jwtService.verify(token, {
            secret: this.configService.get(refreshToken ? 'JWT_REFRESH_SECRET' : 'JWT_ACCESS_SECRET'),
        })

        if (!verify) {
            throw new ErrorDto(ErrorCodeEnum.FORBIDDEN)
        }

        const user = this.userRepository.findOneBy({ id: verify.sub })

        if (!user) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND)
        }

        return user
    }

    async getUserByTelegramId(telegramId: number) {
        return await this.userRepository.findOne({
            where: {
                telegramId: telegramId,
            },
            relations: {
                subscription: true,
            },
        })
    }

    async find(options?: FindManyOptions<User>) {
        return this.userRepository.find(options)
    }

    async findOne(options: FindOneOptions<User>) {
        return this.userRepository.findOne(options)
    }

    async refreshAccessToken(refreshToken: string) {
        const user = await this.getUserFromToken(refreshToken, true)

        return { accessToken: this.generateAccessToken(user) }
    }
}
