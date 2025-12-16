import { Injectable } from '@nestjs/common'
import * as sharp from 'sharp'
import { InjectS3, S3 } from 'nestjs-s3'
import { v4 as uuidv4 } from 'uuid'
import { ConfigService } from '@nestjs/config'
import { In, Repository } from 'typeorm'
import { File } from '../entity/file.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { TypesEnum } from '../enum/types.enum'

@Injectable()
export class FileService {
    constructor(
        @InjectS3() private readonly s3: S3,
        private readonly configService: ConfigService,
        @InjectRepository(File) private readonly fileRepository: Repository<File>,
    ) {}

    async upload(file: Express.Multer.File) {
        const mimeType = file.mimetype

        const newFile = new File()

        if (['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
            const { originalUrl, originalUrlPng } = await this.uploadImage(file.buffer)
            newFile.originalUrl = originalUrl
            newFile.originalUrlPng = originalUrlPng

            newFile.type = TypesEnum.IMAGE

            const imageUrls = await Promise.all(
                [120, 360, 840, 1080, 1320].map(async (targetWidth) => {
                    return {
                        key: `image${targetWidth}Url`,
                        url: await this.uploadImage(await this.resizeImage(file.buffer, targetWidth)),
                    }
                }),
            )

            imageUrls.forEach((imageUrl) => {
                newFile[imageUrl.key] = imageUrl.url
            })

            return newFile.save()
        } else {
            newFile.originalUrl = await this.uploadFile(file.buffer, file.originalname, file.mimetype)
            newFile.type = TypesEnum.FILE

            return newFile.save()
        }
    }

    async createFileFromBuffer(buf: Buffer, filename: string, mimeType: string) {
        const newFile = new File()

        newFile.originalUrl = await this.uploadFile(buf, filename, mimeType)

        return newFile.save()
    }

    // { image: string | Buffer, filename: string = null, s3Bucket: string = 'bclub-test' }
    async uploadImage(image: string | Buffer, filename: string = null, s3Bucket: string = 'bclub-test') {
        let buffer = image

        if (typeof image === 'string') {
            const response = await fetch(image)
            buffer = Buffer.from(await response.arrayBuffer())
        }

        const fileWebp = await sharp(buffer).webp().toBuffer()
        const filePng = await sharp(buffer).png().toBuffer()

        const keyWebp = filename ? `${filename}.webp` : `${uuidv4()}.webp`
        const keyPng = filename ? `${filename}.png` : `${uuidv4()}.png`

        await this.s3.putObject({
            Bucket: s3Bucket,
            Key: keyWebp,
            Body: fileWebp,
            ContentType: 'image/webp',
            ACL: 'public-read',
        })

        await this.s3.putObject({
            Bucket: s3Bucket,
            Key: keyPng,
            Body: filePng,
            ContentType: 'image/png',
            ACL: 'public-read',
        })

        return {
            originalUrl: `${this.configService.get('S3_URL')}/${s3Bucket}/${keyWebp}`,
            originalUrlPng: `${this.configService.get('S3_URL')}/${s3Bucket}/${keyPng}`,
        }
    }

    async uploadFile(
        file: string | Buffer,
        filename: string = null,
        mimeType: string = null,
        s3Bucket: string = 'bclub-test',
    ) {
        let key = uuidv4()

        console.log(filename, filename.slice(filename.lastIndexOf('.') + 1))

        if (filename?.lastIndexOf('.') !== -1) {
            key = `${key}.${filename.slice(filename.lastIndexOf('.') + 1)}`
            console.log(key)
        }

        await this.s3.putObject({
            Bucket: s3Bucket,
            Key: key,
            Body: file,
            ContentType: mimeType,
            ACL: 'public-read',
        })

        return `${this.configService.get('S3_URL')}/${s3Bucket}/${key}`
    }

    async create(file: Partial<File>) {
        return this.fileRepository.create(file).save()
    }

    async resizeImage(image: Buffer, width: number) {
        return sharp(image).resize(width).toBuffer()
    }

    async findFilesById(fileIds: string[]) {
        const foundFiles = await this.fileRepository.findBy({
            id: In(fileIds),
        })

        console.log(foundFiles)

        return foundFiles
    }

    async findAllFiles() {
        return this.fileRepository.find()
    }
}
