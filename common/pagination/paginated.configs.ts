import { PaginateConfig } from 'nestjs-paginate'
import { User } from '../../src/system/user/entity/user.entity'
import { Plan } from '../../src/plan/entity/plan.entity'
import { Survey } from '../../src/survey/entity/survey.entity'
import { Afisha } from '../../src/afisha/entity/afisha.entity'
import { Webinar } from '../../src/webinar/entity/webinar.entity'
import { Conversation } from '../../src/ai/entities/conversation.entity'

export const UsersPaginated: PaginateConfig<User> = {
    defaultSortBy: [['createdAt', 'DESC']],
    filterableColumns: {
        id: true,
        name: true,
        email: true,
        phone: true,
    },
    relations: {},
    searchableColumns: [],
    select: undefined,
    sortableColumns: ['id'],
    where: undefined,
    maxLimit: 60,
    defaultLimit: 60,
}

export const PlansPaginated: PaginateConfig<Plan> = {
    defaultSortBy: [['createdAt', 'DESC']],
    filterableColumns: {
        id: true,
        name: true,
    },
    relations: {},
    searchableColumns: [],
    select: undefined,
    sortableColumns: ['id'],
    where: undefined,
    maxLimit: 60,
    defaultLimit: 60,
}

export const SurveysPaginated: PaginateConfig<Survey> = {
    defaultSortBy: [['createdAt', 'DESC']],
    filterableColumns: {
        id: true,
        first_name: true,
        last_name: true,
    },
    relations: {},
    searchableColumns: [],
    select: undefined,
    sortableColumns: ['id'],
    where: undefined,
    maxLimit: 60,
    defaultLimit: 60,
}

export const AfishaPaginated: PaginateConfig<Afisha> = {
    defaultSortBy: [['createdAt', 'DESC']],
    filterableColumns: {
        id: true,
    },
    relations: {
        previewFile: true,
    },
    searchableColumns: [],
    select: undefined,
    sortableColumns: ['id'],
    where: undefined,
    maxLimit: 60,
    defaultLimit: 60,
}

export const WebinarsPaginated: PaginateConfig<Webinar> = {
    defaultSortBy: [['createdAt', 'DESC']],
    filterableColumns: {
        id: true,
    },
    relations: {
        previewFile: true,
        contentFile: true,
    },
    searchableColumns: [],
    select: undefined,
    sortableColumns: ['id'],
    where: undefined,
    maxLimit: 60,
    defaultLimit: 60,
}

export const ConversationsPaginated: PaginateConfig<Conversation> = {
    defaultSortBy: [['createdAt', 'DESC']],
    filterableColumns: {
        id: true,
    },
    relations: {},
    searchableColumns: [],
    select: undefined,
    sortableColumns: ['id'],
    where: undefined,
    maxLimit: 60,
    defaultLimit: 60,
}
