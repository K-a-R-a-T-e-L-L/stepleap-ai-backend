import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TelegrafModule } from 'nestjs-telegraf'
import { buildDataSourceOptions } from './database.provider'
import { validationSchema } from './env.validation'
import { UserModule } from './system/user/user.module'
import { BotModule } from './bot/bot.module'
import { S3Module } from 'nestjs-s3'
import { FileModule } from './file/file.module'
import { PlanModule } from './plan/plan.module'
import { PaymentModule } from './payment/payment.module'
import { SubscriptionModule } from './subscription/subscription.module'
import { YookassaModule } from 'nestjs-yookassa'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { TelegramLoggerModule } from './logger/logger.module'
import { NotificationModule } from './notification/notification.module'
import { AutomationTemplateModule } from './automation-template/automation-template.module'
import { UserAutomationModule } from './user-automation/user-automation.module'
import { AutomationRunLogModule } from './automation-run-log/automation-run-log.module'
import { N8nModule } from './n8n/n8n.module'
import { BillingModule } from './billing/billing.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: buildDataSourceOptions,
        }),
        TelegrafModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                token: configService.get('TELEGRAM_TOKEN'),
                options: {
                    telegram: {
                        testEnv: false,
                    },
                },
                include: [BotModule],
            }),
        }),
        YookassaModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                shopId: configService.get('YOOKASSA_SHOP_ID'),
                apiKey: configService.get('YOOKASSA_SECRET_KEY'),
            }),
        }),
        S3Module.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                config: {
                    credentials: {
                        accessKeyId: configService.get('S3_ACCESS_KEY_ID'),
                        secretAccessKey: configService.get('S3_SECRET_ACCESS_KEY'),
                    },
                    region: 'default',
                    endpoint: configService.get('S3_URL'),
                    forcePathStyle: true,
                },
            }),
        }),
        TelegramLoggerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                chatId: configService.get('TELEGRAM_ADMINCHAT_ID'),
            }),
        }),
        NotificationModule,
        EventEmitterModule.forRoot(),
        UserModule,
        BotModule,
        FileModule,
        PlanModule,
        PaymentModule,
        SubscriptionModule,
        AutomationTemplateModule,
        UserAutomationModule,
        AutomationRunLogModule,
        N8nModule,
        BillingModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
