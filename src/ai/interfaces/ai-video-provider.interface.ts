import { File } from 'src/file/entity/file.entity'

export interface AiVideoProvider {
    generateVideo(input: any, config: any): Promise<File>
}
