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
import { SurveyModule } from './survey/survey.module'
import { ChatModule } from './chat/chat.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { TelegramLoggerModule } from './logger/logger.module'
import { NotificationModule } from './notification/notification.module'
import { AiModule } from './ai/ai.module'
import { GeminiModule } from './gemini/gemini.module'
import { ElevenlabsModule } from './elevenlabs/elevenlabs.module'
import { KlingModule } from './kling/kling.module'
import { CaptionsModule } from './captions/captions.module'
import { SoraModule } from './sora/sora.module'
import { PipelineModule } from './pipeline/pipeline.module'
import { ConversationModule } from './conversation/conversation.module'

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
        TelegrafModule.forRoot({
            token: process.env.TELEGRAM_TOKEN,
            options: {
                telegram: {
                    testEnv: process.env.ENV === 'dev',
                },
            },
            include: [BotModule],
        }),
        YookassaModule.forRoot({
            shopId: process.env.YOOKASSA_SHOP_ID,
            apiKey: process.env.YOOKASSA_SECRET_KEY,
        }),
        S3Module.forRoot({
            config: {
                credentials: {
                    accessKeyId: process.env.S3_ACCESS_KEY_ID,
                    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
                },
                region: 'default',
                endpoint: process.env.S3_URL,
                forcePathStyle: true,
            },
        }),
        TelegramLoggerModule.forRoot({
            chatId: process.env.TELEGRAM_ADMINCHAT_ID,
        }),
        NotificationModule,
        EventEmitterModule.forRoot(),
        UserModule,
        BotModule,
        FileModule,
        PlanModule,
        PaymentModule,
        SubscriptionModule,
        SurveyModule,
        ChatModule,
        AiModule,
        GeminiModule,
        ElevenlabsModule,
        KlingModule,
        CaptionsModule,
        SoraModule,
        PipelineModule,
        ConversationModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
