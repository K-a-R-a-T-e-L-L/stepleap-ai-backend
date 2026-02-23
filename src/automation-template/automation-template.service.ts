import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { AutomationTemplate } from './entities/automation-template.entity'
import { CreateAutomationTemplateDto } from './dto/create-automation-template.dto'
import { UpdateAutomationTemplateDto } from './dto/update-automation-template.dto'
import { AutomationTemplateStep } from './entities/automation-template-step.entity'
import { AutomationTemplateStepDto } from './dto/automation-template-step.dto'

@Injectable()
export class AutomationTemplateService {
    constructor(
        @InjectRepository(AutomationTemplate)
        private readonly automationTemplateRepository: Repository<AutomationTemplate>,
        @InjectRepository(AutomationTemplateStep)
        private readonly automationTemplateStepRepository: Repository<AutomationTemplateStep>,
    ) {}

    async create(createAutomationTemplateDto: CreateAutomationTemplateDto) {
        const { steps, ...templateData } = createAutomationTemplateDto
        const entity = this.automationTemplateRepository.create(templateData)
        const saved = await this.automationTemplateRepository.save(entity)

        if (steps?.length) {
            await this.replaceSteps(saved.id, steps)
        }

        return this.findOne(saved.id)
    }

    async findAll() {
        const templates = await this.automationTemplateRepository.find()
        return templates.map((template) => this.sortSteps(template))
    }

    async findOne(id: string) {
        const template = await this.automationTemplateRepository.findOne({ where: { id } })

        if (!template) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND)
        }

        return this.sortSteps(template)
    }

    async update(id: string, updateAutomationTemplateDto: UpdateAutomationTemplateDto) {
        const { steps, ...templatePatch } = updateAutomationTemplateDto
        const template = await this.findOne(id)
        const updated = this.automationTemplateRepository.merge(template, templatePatch)
        await this.automationTemplateRepository.save(updated)

        if (steps) {
            await this.replaceSteps(id, steps)
        }

        return this.findOne(id)
    }

    async remove(id: string) {
        await this.findOne(id)
        await this.automationTemplateRepository.softDelete(id)

        return { id }
    }

    private async replaceSteps(templateId: string, steps: AutomationTemplateStepDto[]) {
        await this.automationTemplateStepRepository.delete({ templateId })
        if (!steps.length) {
            return
        }

        const entities = steps.map((step, index) =>
            this.automationTemplateStepRepository.create({
                templateId,
                code: step.code,
                title: step.title,
                titleRu: step.titleRu,
                titleEn: step.titleEn,
                description: step.description,
                sortOrder: step.sortOrder ?? (index + 1) * 10,
            }),
        )
        await this.automationTemplateStepRepository.save(entities)
    }

    private sortSteps(template: AutomationTemplate) {
        if (!template.steps?.length) {
            return template
        }

        template.steps = [...template.steps].sort((a, b) => a.sortOrder - b.sortOrder)
        return template
    }
}
