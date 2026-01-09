import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { AiTextProvider } from 'src/ai/interfaces/ai-text-provider.interface'
import { AiVideoProvider } from 'src/ai/interfaces/ai-video-provider.interface'
import { File } from 'src/file/entity/file.entity'
import { FileService } from 'src/file/services/file.service'
import { ProxyAgent } from 'undici'
import { v4 } from 'uuid'

type ChatGPTConfig = {
    model: string
}

type ChatGPTVideoConfig = {
    seconds: OpenAI.Videos.VideoSeconds
    model: OpenAI.Videos.VideoModel
    size: OpenAI.Videos.VideoSize
}

@Injectable()
export class ChatGPTService implements AiTextProvider<ChatGPTConfig>, AiVideoProvider {
    private readonly client: OpenAI

    constructor(
        private readonly configService: ConfigService,
        private readonly fileService: FileService,
    ) {
        const dispatcher = new ProxyAgent(configService.get('PROXY_URL'))
        this.client = new OpenAI({ fetchOptions: { dispatcher } })
    }

    async generateText(input: string, config: ChatGPTConfig): Promise<string> {
        const response = await this.client.responses.create({
            model: config.model,
            input: input,
        })

        return response.output_text
    }

    async generateVideo(input: string, config: ChatGPTVideoConfig): Promise<File> {
        let video = await this.client.videos.create({
            prompt: input,
            seconds: config.seconds,
            model: config.model,
            size: config.size,
        })

        if (video.error) {
            console.error(video.error)
            throw new Error(video.error.message)
        }

        while (video.status === 'in_progress' || video.status === 'queued') {
            video = await this.client.videos.retrieve(video.id)

            await new Promise((resolve) => setTimeout(resolve, 10000))
        }

        if (video.status === 'failed') {
            console.error('Video generation failed')
            throw new Error(video.error.message)
        }

        const content = await this.client.videos.downloadContent(video.id)

        const body = content.arrayBuffer()
        const buffer = Buffer.from(await body)

        return this.fileService.createFileFromBuffer(buffer, `${v4()}.mp4`, 'video/mp4')
    }

    private validateConfig(config: any): ChatGPTConfig {
        if (!this.isChatGPTConfig(config)) {
            throw new Error('Invalid config: prompt is required')
        }

        return config
    }

    private isChatGPTConfig(config: any): config is ChatGPTConfig {
        return typeof config === 'object' && config !== null && typeof config.prompt === 'string'
    }
}
