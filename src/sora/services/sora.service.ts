import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FileService } from '../../file/services/file.service'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { ProxyAgent } from 'undici'
import OpenAI from 'openai'
import { CreateVideoDto } from '../dto/create-video.dto'

@Injectable()
export class SoraService {
    private readonly client: OpenAI

    constructor(
        private readonly configService: ConfigService,
        private readonly fileService: FileService,
    ) {
        const dispatcher = new ProxyAgent(configService.get('PROXY_URL'))
        this.client = new OpenAI({ fetchOptions: { dispatcher } })
    }

    async createVideo(createVideoDto: CreateVideoDto) {
        let video = await this.client.videos.create({
            model: createVideoDto.model ?? 'sora-2',
            prompt: createVideoDto.prompt,
            seconds: createVideoDto.seconds,
            size: createVideoDto.size,
        })

        if (video.status === 'failed') {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'Video generation failed')
        }

        return video
    }

    async checkVideoStatus(id: string) {
        let video = await this.client.videos.retrieve(id)

        if (video.status === 'failed') {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'Video generation failed')
        }

        return video
    }

    async downloadVideo(id: string) {
        const content = await this.client.videos.downloadContent(id)

        const buf = Buffer.from(await content.arrayBuffer())

        const file = this.fileService.createFileFromBuffer(buf, 'video.mp4', 'video/mp4')

        return file
    }
}
