import { ConfigService } from '@nestjs/config'
import { DataSourceOptions } from 'typeorm'

import { User } from './system/user/entity/user.entity'
import { File } from './file/entity/file.entity'
import { Plan } from './plan/entity/plan.entity'
import { PaymentProvider } from './payment/entity/payment-provider.entity'
import { Payment } from './payment/entity/payment.entity'
import { Subscription } from './subscription/entity/subscription.entity'
import { Survey } from './survey/entity/survey.entity'
import { Chat } from './chat/entity/chat.entity'
import { Afisha } from './afisha/entity/afisha.entity'
import { Webinar } from './webinar/entity/webinar.entity'

export const buildDataSourceOptions = (configService: ConfigService): DataSourceOptions => ({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: configService.get('DATABASE_PORT'),
    username: configService.get('DATABASE_USER'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_DB'),
    // entities: [User, RefreshToken, File, Plan, PaymentProvider, Payment, Subscription, Survey, Chat, Afisha, Webinar],
    entities: [__dirname + '/**/*.entity.{ts,js}'],
    logging: process.env.ENV == 'dev',
    synchronize: true,
})
