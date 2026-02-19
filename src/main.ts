import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { useContainer } from 'class-validator'
import { config } from 'dotenv'

import { AppModule } from './app.module'
import { TelegramLoggerService } from './logger/logger.service'
import { HttpLoggingInterceptor } from './logger/http-logging.interceptor'
import { AllExceptionsFilter } from './logger/all-exceptions.filter'
import * as cookieParser from "cookie-parser";

async function bootstrap() {
    config()
    const app = await NestFactory.create(AppModule, { cors: { origin: '*' }, bodyParser: true })
    app.setGlobalPrefix('api')
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
            whitelist: true,
        })
    )
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
    app.useGlobalInterceptors(new HttpLoggingInterceptor(app.get(TelegramLoggerService)))
    app.useGlobalFilters(new AllExceptionsFilter(app.get(TelegramLoggerService)))
    useContainer(app.select(AppModule), { fallbackOnErrors: true })
    app.use(cookieParser())

    const configSwagger = new DocumentBuilder()
        .setTitle('Business Club API')
        .setDescription('Business Club API to be used by the Telegram mini-app')
        .setVersion('1.0')
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, configSwagger)
    SwaggerModule.setup('api-docs', app, document)

    await app.listen(3200)
}

bootstrap()
