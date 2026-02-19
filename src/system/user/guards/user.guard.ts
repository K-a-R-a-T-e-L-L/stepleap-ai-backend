import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'

import {UserService} from '../services/user.service'
import {ErrorCodeEnum} from '@common/enums/validator/error.code.enum'
import {ErrorDto} from '@common/errors/error.dto'
import {JwtService} from '@nestjs/jwt'
import {ConfigService} from '@nestjs/config'

@Injectable()
export class UserGuard implements CanActivate {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const token = request.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new ErrorDto(ErrorCodeEnum.AUTH_FAIL, 'Bearer token is required');
        }

        try {
            this.jwtService.verify(token, { secret: this.configService.get('JWT_ACCESS_SECRET') })
        } catch (e: any) {
            throw new ErrorDto(ErrorCodeEnum.AUTH_FAIL, e.message)
        }

        const user = await this.userService.getUserFromToken(token, false)
        request.user = user

        return true
    }
}
