import { ConfigService } from '@nestjs/config'
import { ErrorDto } from '@common/errors/error.dto'
import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
import { NotificationService } from '../notification/notification.service'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { AutomationResult } from './entities/automation-result.entity'

@Injectable()
export class AutomationResultService {
    constructor(
        private readonly configService: ConfigService,
        private readonly notificationService: NotificationService,
        @InjectRepository(AutomationResult)
        private readonly automationResultRepository: Repository<AutomationResult>,
    ) {}

    create(dto: Partial<AutomationResult>) {
        const entity = this.automationResultRepository.create(dto)
        return this.automationResultRepository.save(entity)
    }

    findByRunLog(runLogId: string) {
        return this.automationResultRepository.find({
            where: { runLogId },
            order: { createdAt: 'DESC' },
        })
    }

    async sendToTelegramByRunLog(runLogId: string, userId: string, telegramId: number) {
        const result = await this.automationResultRepository
            .createQueryBuilder('result')
            .leftJoinAndSelect('result.runLog', 'runLog')
            .leftJoinAndSelect('runLog.userAutomation', 'userAutomation')
            .where('result.runLogId = :runLogId', { runLogId })
            .andWhere('userAutomation.userId = :userId', { userId })
            .orderBy('result.createdAt', 'DESC')
            .getOne()

        if (!result?.outputUrl) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND, 'Result not found')
        }

        this.ensureSendableVideoUrl(result.outputUrl)
        await this.notificationService.sendVideo(
            telegramId,
            result.outputUrl,
            'Видео из автоматизации',
        )
        return { ok: true }
    }

    private ensureSendableVideoUrl(url: string) {
        const value = (url || '').trim()
        if (!value) {
            throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND, 'Video url is empty')
        }

        const s3Url = (this.configService.get<string>('S3_URL') || '').trim().replace(/\/+$/, '')
        if (!s3Url) {
            return
        }

        if (!value.startsWith(s3Url)) {
            throw new ErrorDto(ErrorCodeEnum.FORBIDDEN, 'Only internal storage files can be sent to Telegram')
        }
    }
}
