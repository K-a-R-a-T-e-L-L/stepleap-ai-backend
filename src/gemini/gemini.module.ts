import { Module } from '@nestjs/common'
import { GeminiController } from './controllers/gemini.controller'
import { GeminiService } from './services/gemini.service'
import { FileService } from 'src/file/services/file.service'
import { FileModule } from 'src/file/file.module'

@Module({
    imports: [FileModule],
    controllers: [GeminiController],
    providers: [GeminiService],
    exports: [GeminiService],
})
export class GeminiModule {}
