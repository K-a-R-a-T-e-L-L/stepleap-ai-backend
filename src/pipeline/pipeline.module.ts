import { Module } from '@nestjs/common'
import { AiModule } from 'src/ai/ai.module'
import { GeminiModule } from 'src/gemini/gemini.module'
import { PipelineService } from './services/pipeline.service'
import { PipelineController } from './controllers/pipeline.controller'
import { CaptionsModule } from 'src/captions/captions.module'
import { SoraModule } from 'src/sora/sora.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Pipeline } from './entities/pipeline.entity'
import { JwtModule } from '@nestjs/jwt'

@Module({
    imports: [TypeOrmModule.forFeature([Pipeline]), JwtModule, GeminiModule, AiModule, CaptionsModule, SoraModule],
    controllers: [PipelineController],
    providers: [PipelineService],
})
export class PipelineModule {}
