import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { TelegramLoggerService } from './logger.service'

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: TelegramLoggerService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest()
        const { method, url } = req
        const start = Date.now()

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - start
                this.logger.log(`${method} ${url} ${duration}ms`, 'HTTP')
            }),
        )
    }
}
