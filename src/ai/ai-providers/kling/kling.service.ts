import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { ErrorDto } from '@common/errors/error.dto'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AiVideoProvider } from 'src/ai/interfaces/ai-video-provider.interface'
import { File } from 'src/file/entity/file.entity'
import { FileService } from 'src/file/services/file.service'

@Injectable()
export class KlingService implements AiVideoProvider {
    // Access Key: AmEbABeY9p9LgNp4AMeEB3N4ApfrDarN
    // Secret Key: DRBEmGg8fEnffnAn4eED3pEQdmBhGnQG
    token: string

    constructor(
        private jwtService: JwtService,
        private readonly fileService: FileService,
    ) {
        this.token = this.jwtService.sign(
            {
                iss: 'AmEbABeY9p9LgNp4AMeEB3N4ApfrDarN',
                exp: Math.round(Date.now() / 1000 + 2628000),
                nbf: Math.round(Date.now() / 1000 - 5),
            },
            {
                secret: 'DRBEmGg8fEnffnAn4eED3pEQdmBhGnQG',
            },
        )
    }

    async generateVideo(input: any, config: any): Promise<File> {
        const response = await fetch('https://api-singapore.klingai.com/v1/videos/text2video', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: input,
                ...config,
            }),
        })

        if (!response.ok) {
            console.error(response)
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'Error while calling Kling API')
        }

        const data = await response.json()

        if (data.code !== 0) {
            console.error(`Kling API returned an error: ${data.code} ${data.message}`)
            throw new ErrorDto(
                ErrorCodeEnum.ENTITY_CREATION_FAIL,
                `Kling API returned an error: ${data.code} ${data.message}`,
            )
        }

        let videoJob = data.data
        console.log(videoJob)
        while (videoJob['task_status'] !== 'succeed' || videoJob['task_status'] !== 'failed') {
            await new Promise((resolve) => setTimeout(resolve, 10000))
            console.log(videoJob)

            const response = await fetch(`https://api-singapore.klingai.com/v1/videos/text2video/${videoJob.task_id}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'Error while calling Kling API')
            }

            const data = await response.json()

            if (data.code !== 0) {
                throw new ErrorDto(
                    ErrorCodeEnum.ENTITY_CREATION_FAIL,
                    `Kling API returned an error: ${data.code} ${data.message}`,
                )
            }

            videoJob = data.data
        }

        const videoFile = await this.fileService.uploadVideoFromUrl(videoJob.task_result.videos[0].url)
        return videoFile
    }
}
