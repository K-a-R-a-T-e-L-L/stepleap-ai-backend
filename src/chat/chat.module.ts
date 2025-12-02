import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'
import { Chat } from './entity/chat.entity'
import { ChatService } from './services/chat.service'
import { ChatController } from './controllers/chat.controller'
import { JwtModule, JwtService } from '@nestjs/jwt'

@Module({
    imports: [TypeOrmModule.forFeature([Chat]), JwtModule],
    providers: [ChatService, JwtService],
    controllers: [ChatController],
    exports: [ChatService]
})
export class ChatModule {}
