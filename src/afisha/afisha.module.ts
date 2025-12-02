import { Module } from '@nestjs/common';
import { AfishaController } from './controllers/afisha.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Afisha } from './entity/afisha.entity'
import { AfishaService } from './services/afisha.service'
import { JwtModule } from '@nestjs/jwt'

@Module({
    imports: [TypeOrmModule.forFeature([Afisha]), JwtModule],
    providers: [AfishaService],
    controllers: [AfishaController]
})
export class AfishaModule {}
