import {GoogleGenAI} from "@google/genai";

export class GeminiService {
    private readonly geminiClient;

    constructor() {
        this.geminiClient = new GoogleGenAI({})
    }

    async generate(prompt: string) {
        const response = await this.geminiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        })

        return response.text
    }

    async generateImage(prompt: string) {
        const response = await this.geminiClient.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: prompt
        })

        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                console.log(part.text);
            } else if (part.inlineData) {
                const imageData = part.inlineData.data;
                const buffer = Buffer.from(imageData, "base64");

                return buffer
            }
        }
    }
}