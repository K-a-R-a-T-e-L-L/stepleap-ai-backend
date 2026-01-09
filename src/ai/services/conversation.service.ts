// import OpenAI from 'openai'
// import { Observable } from 'rxjs'
// import { User } from '../../system/user/entity/user.entity'
// import { InjectRepository } from '@nestjs/typeorm'
// import { Conversation } from '../entities/conversation.entity'
// import { Repository } from 'typeorm'
// import { BaseService } from '@common/database/base/base.service'
// import { UpdateConversationDto } from '../dto/update-conversation.dto'
// import { PaginateQuery } from 'nestjs-paginate'
// import { ConversationsPaginated } from '@common/pagination/paginated.configs'
// import { Message } from '../entities/message.entity'
// import { ErrorDto } from '@common/errors/error.dto'
// import { ErrorCodeEnum } from '@common/enums/validator/error.code.enum'
// import { ProxyAgent } from 'undici'
// import { ConfigService } from '@nestjs/config'
// import { FileService } from '../../file/services/file.service'
// import { encoding_for_model, get_encoding, TiktokenModel } from 'tiktoken'
// import { UserService } from '../../system/user/services/user.service'

// export class ConversationService extends BaseService<Conversation, null, null> {
//     private readonly client: OpenAI

//     constructor(
//         @InjectRepository(Conversation) private readonly convoRepository: Repository<Conversation>,
//         @InjectRepository(Message) private readonly messagesRepository: Repository<Message>,
//         private readonly fileService: FileService,
//         private readonly configService: ConfigService,
//         private readonly userService: UserService,
//     ) {
//         super(convoRepository)

//         const dispatcher = new ProxyAgent(configService.get('PROXY_URL'))
//         this.client = new OpenAI({ fetchOptions: { dispatcher } })
//     }

//     async getUserConversations(user: User, query: PaginateQuery) {
//         return this.findAll(query, {
//             where: {
//                 userId: user.id,
//             },
//             ...ConversationsPaginated,
//         })
//     }

//     async createUserConversation(user: User) {
//         const newConversation = new Conversation()
//         newConversation.userId = user.id
//         newConversation.inputTokens = 0
//         newConversation.outputTokens = 0
//         newConversation.reasoningTokens = 0
//         return newConversation.save()
//     }

//     async getConversationMessages(userId: string, conversationId: string) {
//         const conversation = await this.convoRepository.findOne({
//             where: {
//                 id: conversationId,
//                 userId: userId,
//             },
//             relations: {
//                 messages: true,
//             },
//             order: {
//                 messages: {
//                     createdAt: 'ASC',
//                 },
//             },
//         })

//         if (!conversation) {
//             throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND)
//         }

//         return conversation.messages
//     }

//     async sendUserMessageToConversation(
//         userId: string,
//         conversationId: string,
//         model: string,
//         input?: string,
//         files?: string[],
//     ): Promise<Observable<MessageEvent>> {
//         const enc = encoding_for_model(model as TiktokenModel)
//         let totalTokensUsed = 0

//         const user = await this.userService.findOne({
//             where: {
//                 id: userId,
//             },
//             relations: {
//                 subscription: {
//                     plan: true,
//                 },
//                 conversations: {
//                     messages: true,
//                 },
//             },
//         })

//         console.log(user)

//         let foundFiles = []

//         if (files) {
//             foundFiles = await this.fileService.findFilesById(files)
//         }

//         const conversation = await this.convoRepository.findOne({
//             where: {
//                 id: conversationId,
//                 userId: userId,
//             },
//             relations: {
//                 messages: true,
//             },
//             order: {
//                 messages: {
//                     createdAt: 'ASC',
//                 },
//             },
//         })

//         if (!conversation) {
//             throw new ErrorDto(ErrorCodeEnum.ENTITY_NOT_FOUND)
//         }

//         const inputTokensLength = enc.encode(input).length

//         let history = []
//         totalTokensUsed += inputTokensLength

//         const newMessage = new Message()
//         newMessage.role = 'user'
//         newMessage.content = input
//         newMessage.files = foundFiles
//         newMessage.conversation = conversation
//         newMessage.tokens = inputTokensLength

//         if (conversation.messages.length > 0) {
//             for (let message of conversation.messages) {
//                 totalTokensUsed += message.tokens

//                 let messageContent = []

//                 if (message.content) {
//                     messageContent.push({
//                         type: message.role === 'user' ? 'input_text' : 'output_text',
//                         text: message.content,
//                     })
//                 }

//                 if (message.files) {
//                     for (let file of message.files) {
//                         messageContent.push({
//                             type: 'input_file',
//                             file_url: file.originalUrl,
//                         })
//                     }
//                 }

//                 history.push({
//                     role: message.role,
//                     content: messageContent,
//                 })
//             }
//         }

//         let tokensUsedEverywhere = 0
//         for (const userConversation of user.conversations) {
//             if (userConversation.id === conversationId) continue

//             for (const conversationMessage of userConversation.messages) {
//                 tokensUsedEverywhere += conversationMessage.tokens
//             }
//         }

//         console.log(tokensUsedEverywhere)

//         if (totalTokensUsed + tokensUsedEverywhere > user.subscription.plan.tokens) {
//             throw new Error('Ran out of tokens')
//         }

//         if (input) {
//             history.push({
//                 role: 'user',
//                 content: [
//                     {
//                         type: 'input_text',
//                         text: input,
//                     },
//                 ],
//             })
//         }

//         if (foundFiles.length > 0) {
//             history.push({
//                 role: 'user',
//                 content: foundFiles.map((file) => {
//                     return {
//                         type: 'input_file',
//                         file_url: file.originalUrl,
//                     }
//                 }),
//             })
//         }

//         return new Observable((subscriber) => {
//             ;(async () => {
//                 try {
//                     const stream = await this.create(model, history)

//                     for await (const event of stream) {
//                         if (event.type === 'response.output_text.delta') {
//                             if (event.delta) {
//                                 subscriber.next({
//                                     data: event.delta,
//                                 } as MessageEvent)
//                             }
//                         }

//                         if (event.type === 'response.completed') {
//                             console.log(event.response)

//                             await newMessage.save()

//                             let outputText = ''
//                             for (const outputItem of event.response.output) {
//                                 if (outputItem.type === 'message' && outputItem.role === 'assistant') {
//                                     for (const contentItem of outputItem.content) {
//                                         if (contentItem.type === 'output_text') {
//                                             outputText += contentItem.text
//                                         }
//                                     }
//                                 }
//                             }

//                             await this.messagesRepository.save({
//                                 conversationId: conversation.id,
//                                 role: 'assistant',
//                                 content: outputText,
//                                 tokens: event.response.usage.output_tokens,
//                             })

//                             await this.convoRepository.update(
//                                 {
//                                     id: conversationId,
//                                 },
//                                 {
//                                     inputTokens: event.response.usage.input_tokens,
//                                     outputTokens: conversation.outputTokens + event.response.usage.output_tokens,
//                                     reasoningTokens:
//                                         conversation.reasoningTokens +
//                                         event.response.usage.output_tokens_details.reasoning_tokens,
//                                 },
//                             )

//                             subscriber.next({
//                                 data: { done: true },
//                             } as MessageEvent)

//                             subscriber.complete()
//                         }

//                         if (event.type === 'error') {
//                             console.error(event)
//                         }
//                     }
//                 } catch (error) {
//                     console.error(error)
//                     subscriber.error(error)
//                 }
//             })()
//         })
//     }

//     async create(model: string, input: string | any[]) {
//         return this.client.responses.create({
//             model: model,
//             input: input,
//             stream: true,
//         })
//     }
// }
