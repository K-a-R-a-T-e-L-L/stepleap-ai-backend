import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'
import { UserAuth, UserAuthType } from '@common/decorators/auth.helpers'
import { FileService } from '../services/file.service'
import { ErrorDto } from '@common/errors/error.dto'
import { File } from '../entity/file.entity'

@ApiTags('Files')
@Controller('files')
export class FilesController {
    constructor(private readonly fileService: FileService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UserAuth(UserAuthType.NOT_AUTH)
    @ApiResponse({ status: 400, type: ErrorDto })
    @ApiResponse({ status: 200, type: File })
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        return this.fileService.upload(file)
    }

    @Get('')
    async get() {
        return this.fileService.findAllFiles()
    }
}
