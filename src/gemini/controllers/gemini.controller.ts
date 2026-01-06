import { Body, Controller, Get } from '@nestjs/common'
import { GeminiService } from '../services/gemini.service'
import { UserDockPost } from '@common/swagger/user.swagger.helper'
import { UserAuthType } from '@common/decorators/auth.helpers'
import { GenerateVideoDto } from '../dto/generate-video.dto'
import { File } from 'src/file/entity/file.entity'

@Controller('gemini')
export class GeminiController {
    constructor(private readonly geminiService: GeminiService) {}

    @Get('')
    async generate() {
        return this.geminiService.generate("'Explain how AI works in a few words'")
    }

    @Get('image')
    async generateImage() {
        return this.geminiService.generateImage(
            'Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme',
        )
    }

    @UserDockPost('video', UserAuthType.NOT_AUTH, GenerateVideoDto, File)
    async generateVideo(@Body() generateVideoDto: GenerateVideoDto) {
        return this.geminiService.generateVideo(generateVideoDto.prompt)
    }
}
