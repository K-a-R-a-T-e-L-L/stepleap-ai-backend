import { Injectable } from '@nestjs/common'
import { AiService } from 'src/ai/services/ai.service'
import { GeminiService } from '../../gemini/services/gemini.service'
import { CaptionsService } from 'src/captions/services/captions.service'
import { SoraService } from 'src/sora/services/sora.service'
import { SoraModels, Seconds, Size } from 'src/sora/dto/create-sora-video.dto'

@Injectable()
export class PipelineService {
    constructor(
        private readonly chatgptService: AiService,
        private readonly geminiService: GeminiService,
        private readonly captionsService: CaptionsService,
        private readonly soraService: SoraService,
    ) {}

    async createPipeline({ prompt, textModel, videoModel }: { textModel: string; prompt: string; videoModel: string }) {
        let textPrompt
        switch (textModel) {
            case 'gemini':
                textPrompt = await this.geminiService.generate(prompt)
                break
            case 'chatgpt':
                textPrompt = (await this.chatgptService.create('gpt-5-mini', prompt)).output_text
                break
        }

        let videoFile
        switch (videoModel) {
            case 'veo':
                videoFile = await this.geminiService.generateVideo(`Make a 9:16 aspect ratio video. ${textPrompt}`)
                console.log(`Gemini response:`)
                console.log(videoFile)
                break
            case 'sora':
                let soraResponse = await this.soraService.createVideo({
                    model: SoraModels.SORA2,
                    prompt: textPrompt,
                    seconds: Seconds.FOUR,
                    size: Size.SIZE_720x1280,
                })

                while (soraResponse.status !== 'completed') {
                    await new Promise((resolve) => setTimeout(resolve, 10000))
                    soraResponse = await this.soraService.checkVideoStatus(soraResponse.id)
                }

                videoFile = await this.soraService.downloadVideo(soraResponse.id)
        }

        const captionedVideo = await this.captionsService.addCaptionToVideo({
            videoUrl: videoFile.originalUrl,
        })

        console.log(`Captioned video:`)
        console.log(captionedVideo)
        return captionedVideo
    }
}
