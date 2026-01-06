import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FileService } from '../../file/services/file.service'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { File } from 'src/file/entity/file.entity'
import * as FormData from 'form-data'
import axios from 'axios'

@Injectable()
export class CaptionsService {
    constructor(
        private readonly configService: ConfigService,
        private readonly fileService: FileService,
    ) {}

    async createVideo(imageReference: string, audioReference: string) {
        const imageFile = await (await fetch(imageReference)).blob()
        const audioFile = await (await fetch(audioReference)).blob()

        const formData = new FormData()
        formData.append('model', 'mirage-video-1-latest')
        formData.append('image_reference', imageFile)
        formData.append('audio_reference', audioFile)

        const response = await fetch('https://api.mirage.app/v1/videos', {
            method: 'POST',
            headers: {
                'x-api-key': this.configService.get('MIRAGE_SECRET_KEY'),
                ...formData.getHeaders(),
            },
            body: formData as any,
        })

        const data = await response.json()

        if (data.error) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, data.error.message)
        }

        return data
    }

    async checkVideoStatus(videoId: string) {
        const response = await fetch(`https://api.mirage.app/v1/videos/${videoId}`, {
            method: 'GET',
            headers: {
                'x-api-key': this.configService.get('MIRAGE_SECRET_KEY'),
            },
        })

        const data = await response.json()

        if (data.error) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, data.error.message)
        }

        return data
    }

    async downloadVideo(videoId: string) {
        const response = await fetch(`https://api.mirage.app/v1/videos/${videoId}/content`, {
            method: 'GET',
            headers: {
                'x-api-key': this.configService.get('MIRAGE_SECRET_KEY'),
            },
            redirect: 'follow',
        })

        const buf = Buffer.from(await response.arrayBuffer())

        const file = this.fileService.createFileFromBuffer(buf, 'test.mp4', 'video/mp4')

        return file
    }

    async addCaptionToVideo({ videoUrl }: { videoUrl: string }) {
        const FormData = require('form-data')
        const form = new FormData()

        form.append('caption_template_id', 'ctpl_yvE0ZnYzEj6ClCD2ee1f')

        // Fetch video as a stream
        const videoResponse = await axios.get(videoUrl, { responseType: 'stream' })
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

        if (response.data.error) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, response.data.error.message)
        }
        return response.data
    }
}
