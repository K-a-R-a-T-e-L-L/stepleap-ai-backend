import { PaymentDetails } from 'nestjs-yookassa';
import {PaymentDetailsInterface} from "../interfaces/payment-details.interface";

export class EndpointDto {
    type: 'notification'
    event: string
    object: PaymentDetailsInterface
}