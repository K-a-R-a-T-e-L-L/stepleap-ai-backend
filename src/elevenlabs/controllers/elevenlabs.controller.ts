import { Body, Controller } from '@nestjs/common'
import { ElevenlabsService } from '../services/elevenlabs.service'
import { ApiTags } from '@nestjs/swagger'
import { UserDockGetOne } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { File } from '../../file/entity/file.entity'

@ApiTags('ElevenLabs')
@Controller('elevenlabs')
export class ElevenlabsController {
    constructor(private readonly elevenLabsService: ElevenlabsService) {}

    @UserDockGetOne('', UserAuthType.NOT_AUTH, File)
    async textToSpeech(@Body() textToSpeechDto: any) {
        return this.elevenLabsService.textToSpeech(textToSpeechDto.text)
    }
}