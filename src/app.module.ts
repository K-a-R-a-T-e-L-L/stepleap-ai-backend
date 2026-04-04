import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TelegrafModule } from 'nestjs-telegraf'
import { buildDataSourceOptions } from './database.provider'
import { validationSchema } from './env.validation'
import { UserModule } from './system/user/user.module'
import { BotModule } from './bot/bot.module'
import { S3Module } from 'nestjs-s3'
import { YookassaModule } from 'nestjs-yookassa'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { TelegramLoggerModule } from './logger/logger.module'
import { NotificationModule } from './notification/notification.module'
import { CareerModule } from './career/career.module'

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
                launchOptions:
                    configService.get<string>('TELEGRAM_BOT_LAUNCH') === 'false'
                        ? false
                        : { dropPendingUpdates: true },
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
        CareerModule,
        EventEmitterModule.forRoot(),
        UserModule,
        BotModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
