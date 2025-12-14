import { Module } from '@nestjs/common';
import { ElevenlabsController } from './controllers/elevenlabs.controller'
import { ElevenlabsService } from './services/elevenlabs.service'
import { FileModule } from '../file/file.module'

@Module({
    imports: [FileModule],
    controllers: [ElevenlabsController],
    providers: [ElevenlabsService]
})
export class ElevenlabsModule {}
