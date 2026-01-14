import { Injectable } from '@nestjs/common'
import { PipelineStepInput } from 'src/pipeline/entities/pipeline-step.entity'
import { GeminiService } from './gemini.service'

@Injectable()
export class VeoService {
    constructor(private readonly geminiService: GeminiService) {}

    async generateOutput(input: PipelineStepInput[], config: any) {
        let prompt = ''
        for (let step of input) {
            if (step.type === 'TEXT') prompt += `${step.content} `
        }

        return {
            type: 'VIDEO',
            content: await this.geminiService.generateVideo(prompt, {}),
        }
    }
}
