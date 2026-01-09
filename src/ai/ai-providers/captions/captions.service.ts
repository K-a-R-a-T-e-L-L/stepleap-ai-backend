import { AiVideoProvider } from 'src/ai/interfaces/ai-video-provider.interface'
import { File } from 'src/file/entity/file.entity'
import axios from 'axios'
import * as FormData from 'form-data'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FileService } from 'src/file/services/file.service'
import { v4 } from 'uuid'

type GenerateCaptionsConfig = {
    captionTemplateId: string
}

@Injectable()
export class CaptionsService implements AiVideoProvider {
    constructor(
        private readonly configService: ConfigService,
        private readonly fileService: FileService,
    ) {}

    async generateVideo(input: File, config: GenerateCaptionsConfig): Promise<File> {
        const FormData = require('form-data')
        const form = new FormData()

        form.append('caption_template_id', config.captionTemplateId)

        // Fetch video as a stream
        const videoResponse = await axios.get(input.originalUrl, { responseType: 'stream' })
        form.append('video', videoResponse.data, {
            filename: 'video.mp4',
            contentType: 'video/mp4',
        })

        const response = await axios.post('https://api.mirage.app/v1/videos/captions', form, {
            headers: {
                'x-api-key': this.configService.get('MIRAGE_SECRET_KEY'),
                ...form.getHeaders(),
            },
        })

        let video = response.data
        while (video.status === 'PROCESSING') {
            await new Promise((resolve) => setTimeout(resolve, 10000))
            video = (await axios.get(`https://api.mirage.app/v1/videos/${video.id}`)).data
        }

        const downloadVideoResponse = await fetch(`https://api.mirage.app/v1/videos/${video.id}/content`, {
            method: 'GET',
            headers: {
                'x-api-key': this.configService.get('MIRAGE_SECRET_KEY'),
            },
            redirect: 'follow',
        })

        const buf = Buffer.from(await downloadVideoResponse.arrayBuffer())

        const file = this.fileService.createFileFromBuffer(buf, `${v4()}.mp4`, 'video/mp4')

        return file
    }
}
