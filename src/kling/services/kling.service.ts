import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { ErrorDto } from '@common/errors/error.dto'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class KlingService {
    // Access Key: AmEbABeY9p9LgNp4AMeEB3N4ApfrDarN
    // Secret Key: DRBEmGg8fEnffnAn4eED3pEQdmBhGnQG
    token: string

    constructor(private jwtService: JwtService) {
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

    async createVideo({ modelName = 'kling-v1', prompt }: { modelName?: string; prompt: string }) {
        const response = await fetch('https://api-singapore.klingai.com/v1/videos/text2video', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model_name: modelName,
                prompt: prompt,
            }),
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

        return data
    }

    async checkVideo({ taskId }: { taskId: string }) {
        const response = await fetch(`https://api-singapore.klingai.com/v1/videos/text2video/${taskId}`, {
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

        return data
    }
}
