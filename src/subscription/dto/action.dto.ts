import { TypeValidate, Validate } from '@common/decorators/validation.helpers'
import {ActionsEnum} from "../enum/actions.enum";

export class ActionDto {
    @Validate(TypeValidate.STRING)
    action: ActionsEnum
}