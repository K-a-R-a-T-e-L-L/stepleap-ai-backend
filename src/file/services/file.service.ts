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

    async upload(file: Express.Multer.File, tag = 'manual-upload') {
        const mimeType = file.mimetype

        const newFile = new File()

        if (['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
            const { originalUrl, originalUrlPng } = await this.uploadImage(file.buffer, null, tag)
            newFile.originalUrl = originalUrl
            newFile.originalUrlPng = originalUrlPng

            newFile.type = TypesEnum.IMAGE

            const imageUrls = await Promise.all(
                [120, 360, 840, 1080, 1320].map(async (targetWidth) => {
                    return {
                        key: `image${targetWidth}Url`,
                        url: await this.uploadImage(await this.resizeImage(file.buffer, targetWidth), null, tag),
                    }
                }),
            )

            imageUrls.forEach((imageUrl) => {
                newFile[imageUrl.key] = imageUrl.url
            })

            return newFile.save()
        } else {
            newFile.originalUrl = await this.uploadFile(file.buffer, file.originalname, file.mimetype, tag)
            newFile.type = TypesEnum.FILE

            return newFile.save()
        }
    }

    async createFileFromBuffer(buf: Buffer, filename: string, mimeType: string, tag = 'internal') {
        const newFile = new File()

        newFile.originalUrl = await this.uploadFile(buf, filename, mimeType, tag)

        return newFile.save()
    }

    async uploadImage(image: string | Buffer, filename: string = null, tag = 'images') {
        const s3Bucket = this.getBucketName()
        const normalizedTag = this.normalizeTag(tag)
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
            Key: `${normalizedTag}/${keyWebp}`,
            Body: fileWebp,
            ContentType: 'image/webp',
            ACL: 'public-read',
        })

        await this.s3.putObject({
            Bucket: s3Bucket,
            Key: `${normalizedTag}/${keyPng}`,
            Body: filePng,
            ContentType: 'image/png',
            ACL: 'public-read',
        })

        return {
            originalUrl: `${this.configService.get('S3_URL')}/${s3Bucket}/${normalizedTag}/${keyWebp}`,
            originalUrlPng: `${this.configService.get('S3_URL')}/${s3Bucket}/${normalizedTag}/${keyPng}`,
        }
    }

    async uploadVideoFromUrl(url: string, tag = 'video-url') {
        const response = await fetch(url)
        const buffer = Buffer.from(await response.arrayBuffer())
        return this.createFileFromBuffer(buffer, `${uuidv4()}.mp4`, 'video/mp4', tag)
    }

    async uploadFile(file: string | Buffer, filename: string = null, mimeType: string = null, tag = 'files') {
        const s3Bucket = this.getBucketName()
        const normalizedTag = this.normalizeTag(tag)
        let key = uuidv4()

        if (filename?.lastIndexOf('.') !== -1) {
            key = `${key}.${filename.slice(filename.lastIndexOf('.') + 1)}`
        }

        await this.s3.putObject({
            Bucket: s3Bucket,
            Key: `${normalizedTag}/${key}`,
            Body: file,
            ContentType: mimeType,
            ACL: 'public-read',
        })

        return `${this.configService.get('S3_URL')}/${s3Bucket}/${normalizedTag}/${key}`
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

        return foundFiles
    }

    async findAllFiles() {
        return this.fileRepository.find()
    }

    private getBucketName() {
        const explicitBucket = this.configService.get<string>('S3_BUCKET')
        if (explicitBucket) {
            return explicitBucket
        }
        throw new Error('S3_BUCKET is not configured')
    }

    private normalizeTag(tag?: string) {
        const value = (tag || 'files').trim().toLowerCase()
        const sanitized = value.replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-')
        return sanitized || 'files'
    }
}
