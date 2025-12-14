import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FileService } from '../../file/services/file.service'

@Injectable()
export class CaptionsService {
    constructor(
        private readonly configService: ConfigService,
        private readonly fileService: FileService
    ) {
    }

    async createVideo(imageReference: string, audioReference: string) {
        const imageFile = await (await fetch(imageReference)).blob()
        const audioFile = await (await fetch(audioReference)).blob()

        const formData = new FormData()
        formData.append('model', 'mirage-video-1-latest')
        formData.append('image_reference', imageFile)
        formData.append('audio_reference', audioFile)

        const response = await fetch("https://api.mirage.app/v1/videos", {
            method: "POST",
            headers: {
                "x-api-key": this.configService.get('MIRAGE_SECRET_KEY')
            },
            body: formData
        });

        const data = await response.json()

        return data
    }

    async checkVideoStatus(videoId: string) {
        const response = await fetch(`https://api.mirage.app/v1/videos/${videoId}`, {
            method: "GET",
            headers: {
                "x-api-key": this.configService.get('MIRAGE_SECRET_KEY')
            }
        });

        return response.json()
    }

    async downloadVideo(videoId: string) {
        const response = await fetch(`https://api.mirage.app/v1/videos/${videoId}/content`, {
            method: "GET",
            headers: {
                "x-api-key": this.configService.get('MIRAGE_SECRET_KEY')
            },
            redirect: "follow"
        });

        const buf = Buffer.from(await response.arrayBuffer())

        const file = this.fileService.createFileFromBuffer(buf, 'test.mp4', 'video/mp4')

        return file
    }
}