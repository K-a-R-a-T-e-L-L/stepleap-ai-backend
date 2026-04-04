import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { useContainer } from 'class-validator'
import { config } from 'dotenv'
import { AppModule } from './app.module'
import { TelegramLoggerService } from './logger/logger.service'
import { AllExceptionsFilter } from './logger/all-exceptions.filter'
import * as cookieParser from 'cookie-parser'
import * as express from 'express'

async function bootstrap() {
    config()
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const configuredOrigins = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    const allowedOrigins = new Set([frontendUrl, ...configuredOrigins])

    const app = await NestFactory.create(AppModule, {
        cors: {
            origin: (origin, callback) => {
                if (!origin) {
                    callback(null, true)
                    return
                }

                if (allowedOrigins.has(origin)) {
                    callback(null, true)
                    return
                }

                callback(null, false)
            },
            credentials: true,
            methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        },
        bodyParser: false,
        logger: ['log', 'warn', 'error'],
    })
    app.use(
        express.json({
            verify: (req: any, _res, buf) => {
                req.rawBody = Buffer.from(buf)
            },
        }),
    )
    app.use(
        express.urlencoded({
            extended: true,
            verify: (req: any, _res, buf) => {
                req.rawBody = Buffer.from(buf)
            },
        }),
    )
    app.setGlobalPrefix('api')
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
            whitelist: true,
        })
    )
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
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

    const port = Number(process.env.PORT || 3000)
    await app.listen(port)
    app.get(TelegramLoggerService).warn(`Server started on port ${port}`, 'Bootstrap')
}

bootstrap()
