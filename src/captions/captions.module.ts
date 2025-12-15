import { Module } from '@nestjs/common'
import { CaptionsController } from './controllers/captions.controller'
import { CaptionsService } from './services/captions.service'
import { FileModule } from '../file/file.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
    imports: [FileModule, JwtModule],
    controllers: [CaptionsController],
    providers: [CaptionsService],
})
export class CaptionsModule {}
