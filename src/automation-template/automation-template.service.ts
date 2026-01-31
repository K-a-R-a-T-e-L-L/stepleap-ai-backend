import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { AutomationTemplate } from './entities/automation-template.entity'
import { CreateAutomationTemplateDto } from './dto/create-automation-template.dto'
import { UpdateAutomationTemplateDto } from './dto/update-automation-template.dto'

@Injectable()
export class AutomationTemplateService {
    constructor(
        @InjectRepository(AutomationTemplate)
        private readonly automationTemplateRepository: Repository<AutomationTemplate>,
    ) {}

    create(createAutomationTemplateDto: CreateAutomationTemplateDto) {
        const entity = this.automationTemplateRepository.create(createAutomationTemplateDto)
        return this.automationTemplateRepository.save(entity)
    }

    findAll() {
        return this.automationTemplateRepository.find()
    }

    async findOne(id: string) {
        const template = await this.automationTemplateRepository.findOne({ where: { id } })

        if (!template) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND)
        }

        return template
    }

    async update(id: string, updateAutomationTemplateDto: UpdateAutomationTemplateDto) {
        const template = await this.findOne(id)
        const updated = this.automationTemplateRepository.merge(template, updateAutomationTemplateDto)

        return this.automationTemplateRepository.save(updated)
    }

    async remove(id: string) {
        await this.findOne(id)
        await this.automationTemplateRepository.softDelete(id)

        return { id }
    }
}
