import {Controller, Get} from "@nestjs/common";
import {GeminiService} from "../services/gemini.service";

@Controller('gemini')
export class GeminiController {
    constructor(
        private readonly geminiService: GeminiService
    ) {
    }
    
    @Get('')
    async generate() {
        return this.geminiService.generate("'Explain how AI works in a few words'")
    }

    @Get('image')
    async generateImage() {
        return this.geminiService.generateImage('Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme')
    }
}