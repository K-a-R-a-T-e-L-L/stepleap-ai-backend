import { Module } from '@nestjs/common'
import { SoraController } from './controllers/sora.controller'
import { SoraService } from './services/sora.service'
import { FileModule } from '../file/file.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
    imports: [FileModule, JwtModule],
    controllers: [SoraController],
    providers: [SoraService],
})
export class SoraModule {}
