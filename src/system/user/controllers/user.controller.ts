import { Body, Controller, Req, Res } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { User } from '../entity/user.entity'
import { UserService } from '../services/user.service'
import { UserDockGetOne, UserDockPost } from '@common/swagger/user.swagger.helper'
import { UserDecorator } from '../decorators/user.decorator'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { TgAuthDto } from '../dto/tg-auth.dto'
import { Request } from 'express'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { RefreshResponseDto } from '../dto/refresh-response.dto'
import { TgAuthResponseDto } from '../dto/tg-auth-response.dto'

@Controller('user')
@ApiTags('User')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UserDockPost('tg-auth', UserAuthType.NOT_AUTH, TgAuthDto, TgAuthResponseDto)
    async authenticate(@Res({ passthrough: true }) response: any, @Body() tgAuth: TgAuthDto) {
        const { isNewUser, refreshToken, accessToken } = await this.userService.authenticate(tgAuth.rawInitData)

        response.cookie('refresh_token', refreshToken, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 30,
        })

        return { accessToken, isNewUser }
    }

    // @UserDockPost('refresh', UserAuthType.NOT_AUTH, null, RefreshResponseDto)
    // async refreshAccessToken(@Req() request: Request) {
    //     const refreshToken = request.cookies['refresh_token']
    //
    //     if (!refreshToken) {
    //         throw new ErrorDto(ErrorCodeEnum.AUTH_FAIL)
    //     }
    //
    //     return this.userService.refreshAccessToken(refreshToken)
    // }

    @UserDockGetOne('', UserAuthType.USER, User, 'Получить запись пользователя')
    async get(@UserDecorator() user: User) {
        return this.userService.getUserByTelegramId(user.telegramId)
    }
}
