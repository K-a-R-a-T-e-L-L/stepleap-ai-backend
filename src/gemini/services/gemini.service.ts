import { GoogleGenAI } from '@google/genai'
import { FileService } from '../../file/services/file.service'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import { ProxyAgent, fetch as undiciFetch } from 'undici'

@Injectable()
export class GeminiService {
    private readonly geminiClient: GoogleGenAI

    constructor(
        private readonly fileService: FileService,
        private readonly configService: ConfigService,
    ) {
        const proxyUrl = this.configService.get<string>('PROXY_URL')

        if (proxyUrl) {
            const dispatcher = new ProxyAgent(proxyUrl)

            // Define the override
            globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
                // undici's fetch is slightly stricter with types than the global one
                // We cast the configuration to 'any' to allow the 'dispatcher'
                // and to bypass the 'duplex' requirement error.
                const fetchOptions = {
                    ...init,
                    dispatcher,
                } as any

                // If the body exists, undici often requires 'duplex' to be set
                if (init?.body && !fetchOptions.duplex) {
                    fetchOptions.duplex = 'half'
                }

                return undiciFetch(input as any, fetchOptions) as unknown as Promise<Response>
            }
        }

        this.geminiClient = new GoogleGenAI({
            apiKey: this.configService.get<string>('GEMINI_API_KEY'),
        })
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
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                durationSeconds: 4,
                aspectRatio: '9:16',
            },
        })

        while (!operation.done) {
            console.log('Waiting for video generation to complete...')
            await new Promise((resolve) => setTimeout(resolve, 10000))
            // Refresh operation status
            operation = await this.geminiClient.operations.getVideosOperation({
                operation: operation,
            })
        }

        const filename = `${uuidv4()}.mp4`
        const tempPath = `tmp/${filename}`

        // Ensure tmp directory exists
        if (!fs.existsSync('tmp')) {
            fs.mkdirSync('tmp')
        }

        await this.geminiClient.files.download({
            file: operation.response.generatedVideos[0].video,
            downloadPath: tempPath,
        })

        const file = await this.fileService.createFileFromBuffer(fs.readFileSync(tempPath), filename, 'video/mp4')

        fs.unlink(tempPath, (err) => {
            if (err) console.error('Error deleting temp file:', err)
        })

        return file
    }
}
