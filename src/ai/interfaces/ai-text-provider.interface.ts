export interface AiTextProvider<TConfig = any> {
    generateText(input: string, config: TConfig): Promise<string>
}
