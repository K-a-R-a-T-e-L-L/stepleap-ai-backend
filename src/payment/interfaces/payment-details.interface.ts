import { PaymentDetails } from 'nestjs-yookassa'

export interface PaymentDetailsInterface extends PaymentDetails {
    metadata?: {
        subscription_id: string
    }

    payment_method?: PaymentDetails['payment_method'] & {
        id: string
    }
}