import { GoogleGenAI } from '@google/genai'
import { FileService } from '../../file/services/file.service'
import { Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'

@Injectable()
export class GeminiService {
    private readonly geminiClient: GoogleGenAI

    constructor(private readonly fileService: FileService) {
        this.geminiClient = new GoogleGenAI({})
    }

    async generate(prompt: string) {
        const response = await this.geminiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        })

        return response.text
    }

    async generateImage(prompt: string) {
        const response = await this.geminiClient.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: prompt,
        })

        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                console.log(part.text)
            } else if (part.inlineData) {
                const imageData = part.inlineData.data
                const buffer = Buffer.from(imageData, 'base64')

                return buffer
            }
        }
    }

    async generateVideo(prompt: string) {
        let operation = await this.geminiClient.models.generateVideos({
            model: 'veo-3.1-generate-preview',
            prompt: prompt,
            config: {
                durationSeconds: 4,
            },
        })

        while (!operation.done) {
            console.log('Waiting for video generation to complete...')
            await new Promise((resolve) => setTimeout(resolve, 10000))
            operation = await this.geminiClient.operations.getVideosOperation({
                operation: operation,
            })
        }

        const filename = `${uuidv4()}.mp4`

        await this.geminiClient.files.download({
            file: operation.response.generatedVideos[0].video,
            downloadPath: `tmp/${filename}`,
        })

        const file = await this.fileService.createFileFromBuffer(
            fs.readFileSync(`tmp/${filename}`),
            filename,
            'video/mp4',
        )
        fs.unlink(`tmp/${filename}`, (err) => console.log(err))
        return file
    }
}
