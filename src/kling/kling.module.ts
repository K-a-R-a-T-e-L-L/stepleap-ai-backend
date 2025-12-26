import { Module } from '@nestjs/common'
import { KlingController } from './controllers/kling.controller'
import { JwtModule } from '@nestjs/jwt'
import { KlingService } from './services/kling.service'

@Module({
    imports: [JwtModule],
    controllers: [KlingController],
    providers: [KlingService],
})
export class KlingModule {}
