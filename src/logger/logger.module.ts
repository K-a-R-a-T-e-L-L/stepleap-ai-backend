import { Module, DynamicModule, Global } from '@nestjs/common'
import { TelegramLoggerService, TelegramLoggerConfig } from './logger.service'

@Global()
@Module({})
export class TelegramLoggerModule {
    static forRoot(config: TelegramLoggerConfig): DynamicModule {
        const configProvider = {
            provide: 'TELEGRAM_LOGGER_CONFIG',
            useValue: config,
        }

        const loggerProvider = {
            provide: TelegramLoggerService,
            useClass: TelegramLoggerService,
        }

        return {
            module: TelegramLoggerModule,
            providers: [configProvider, loggerProvider],
            exports: [TelegramLoggerService],
        }
    }
}
