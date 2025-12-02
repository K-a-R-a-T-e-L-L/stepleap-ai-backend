import { BaseService } from '@common/database/base/base.service'
import { Webinar } from '../entity/webinar.entity'
import { CreateWebinarDto } from '../dto/create-webinar.dto'
import { UpdateWebinarDto } from '../dto/update-webinar.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

export class WebinarService extends BaseService<Webinar, CreateWebinarDto, UpdateWebinarDto> {
    constructor(
        @InjectRepository(Webinar) private readonly webinarRepository: Repository<Webinar>
    ) {
        super(webinarRepository);
    }
}