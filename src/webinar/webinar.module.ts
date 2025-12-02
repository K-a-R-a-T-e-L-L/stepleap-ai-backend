import { Module } from '@nestjs/common'
import { WebinarController } from './controllers/webinar.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Webinar } from './entity/webinar.entity'
import { WebinarService } from './services/webinar.service'
import { JwtModule } from '@nestjs/jwt'

@Module({
    imports: [TypeOrmModule.forFeature([Webinar]), JwtModule],
    providers: [WebinarService],
    controllers: [WebinarController],
})
export class WebinarModule {}
