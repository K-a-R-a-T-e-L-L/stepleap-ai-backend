import { Injectable } from '@nestjs/common'
import { GeminiService } from './gemini/gemini.service'
import { ChatGPTService } from './chatgpt/chatgpt.service'
import { VeoService } from './gemini/veo.service'

@Injectable()
export class AiProvidersService {
    constructor(
        private readonly geminiService: GeminiService,
        private readonly chatgptService: ChatGPTService,
        private readonly veoService: VeoService,
    ) {}

    getAiProvider(aiProviderName: string): GeminiService | ChatGPTService | VeoService | null {
        switch (aiProviderName) {
            case 'GEMINI':
                return this.geminiService
                break
            case 'CHATGPT':
                return this.chatgptService
                break
            case 'VEO':
                return this.veoService
                break
        }
    }
}
