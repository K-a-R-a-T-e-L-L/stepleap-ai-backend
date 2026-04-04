import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserController } from './controllers/user.controller'
import { User } from './entity/user.entity'
import { UserService } from './services/user.service'
import { UserAdminController } from './controllers/user.admin.controller'
import { UserGuard } from './guards/user.guard'
import { RoleGuard } from './guards/role.guard'

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([User]), JwtModule],
    providers: [UserService, ConfigModule, UserGuard, RoleGuard],
    controllers: [UserController, UserAdminController],
    exports: [UserService, JwtModule],
})
export class UserModule {}
