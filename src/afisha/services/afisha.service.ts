import { BaseService } from '@common/database/base/base.service'
import { Afisha } from '../entity/afisha.entity'
import { CreateAfishaDto } from '../dto/create-afisha.dto'
import { UpdateAfishaDto } from '../dto/update-afisha.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

export class AfishaService extends BaseService<Afisha, CreateAfishaDto, UpdateAfishaDto> {
    constructor(
        @InjectRepository(Afisha) private readonly afishaRepository: Repository<Afisha>
    ) {
        super(afishaRepository);
    }
}