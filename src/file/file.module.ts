import { Module } from '@nestjs/common'
import { FileService } from './services/file.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../system/user/entity/user.entity'
import { FilesController } from './controllers/file.controller'
import { File } from './entity/file.entity'

@Module({
    imports: [TypeOrmModule.forFeature([File])],
    controllers: [FilesController],
    providers: [FileService],
    exports: [FileService],
})
export class FileModule {}
