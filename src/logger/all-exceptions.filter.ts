import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { TelegramLoggerService } from './logger.service'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly logger: TelegramLoggerService) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const hostType = host.getType<'http' | 'rpc' | 'ws'>()
        const status =
            exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : { statusCode: status, message: 'Internal server error' }

        // Telegraf/WS/RPC exceptions do not have Express response/status.
        if (hostType !== 'http') {
            if (status >= 500) {
                this.logger.error(
                    {
                        status,
                        type: hostType,
                        message,
                    },
                    exception instanceof Error ? exception.stack : undefined,
                    'Exception',
                )
            } else {
                this.logger.warn(
                    {
                        status,
                        type: hostType,
                        message,
                    },
                    'Exception',
                )
            }
            return
        }

        const ctx = host.switchToHttp()
        const response = ctx.getResponse()
        const request = ctx.getRequest()

        const payload = {
            status,
            path: request.url,
            method: request.method,
            message,
        }
        if (status >= 500) {
            this.logger.error(payload, exception instanceof Error ? exception.stack : undefined, 'Exception')
        } else {
            this.logger.warn(payload, 'Exception')
        }

        response.status(status).json(message)
    }
}
