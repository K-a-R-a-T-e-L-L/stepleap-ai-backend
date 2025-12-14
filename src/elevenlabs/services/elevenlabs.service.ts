import { Injectable } from '@nestjs/common'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { writeFile } from 'node:fs/promises'
import { v4 as uuid } from 'uuid'
import { FileService } from '../../file/services/file.service'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { buffer } from 'node:stream/consumers'

@Injectable()
export class ElevenlabsService {
    private readonly elevenlabs

    constructor(private readonly fileService: FileService) {
        this.elevenlabs = new ElevenLabsClient()
    }

    async textToSpeech(text: string) {
        try {
            const audio = await this.elevenlabs.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
                text,
                model_id: 'eleven_multilingual_v2',
                output_format: 'mp3_44100_128',
            })

            const filename = `${uuid()}.mp3`

            const buf = await buffer(audio)

            const file = await this.fileService.createFileFromBuffer(buf, filename, 'audio/mpeg')

            return file
        } catch (e) {
            console.error(e)
            throw new ErrorDto(ErrorCodeEnum.ENTITY_CREATION_FAIL, 'Failed to convert text to speech')
        }
    }
}