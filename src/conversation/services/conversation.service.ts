import { Injectable } from '@nestjs/common'
import { User } from 'src/system/user/entity/user.entity'
import { Conversation } from '../entities/conversation.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SendMessageDto } from '../dto/send-message.dto'
import { Message } from '../entities/message.entity'
import { GeminiService } from 'src/ai/ai-providers/gemini/gemini.service'
import { CreateConversationDto } from '../dto/create-conversation.dto'
import { KlingService } from 'src/ai/ai-providers/kling/kling.service'

@Injectable()
export class ConversationService {
    constructor(
        @InjectRepository(Conversation) private readonly conversationRepository: Repository<Conversation>,
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
        private readonly geminiService: GeminiService,
        private readonly klingService: KlingService,
    ) {}

    async createConversation(user: User, createConversationDto: CreateConversationDto): Promise<Conversation> {
        const newConversation = this.conversationRepository.create({
            userId: user.id,
            model: createConversationDto.model,
        })

        return newConversation.save()
    }

    async getUserConversations(user: User): Promise<Conversation[]> {
        return this.conversationRepository.find({
            where: {
                userId: user.id,
            },
            order: {
                createdAt: 'DESC',
            },
        })
    }

    async getConversationHistory(conversationId: string): Promise<any> {
        const conversation = await this.conversationRepository.findOne({
            where: {
                id: conversationId,
            },
            relations: {
                messages: true,
            },
        })

        return conversation.messages
    }

    async sendUserMessageToConversation(
        user: User,
        userMessage: SendMessageDto,
        conversationId: string,
    ): Promise<Message> {
        const conversation = await this.conversationRepository.findOne({
            where: {
                id: conversationId,
            },
            relations: {
                messages: true,
            },
        })

        switch (conversation.model) {
            case 'GEMINI':
                let history = this.assembleGeminiChatHistory(conversation.messages)
                history.push({
                    role: 'user',
                    parts: [
                        {
                            text: userMessage.input,
                        },
                    ],
                })

                console.log(history)

                const response = await this.geminiService.generateText(history)

                const newMessage = new Message()
                newMessage.role = 'user'
                newMessage.items = []
                newMessage.conversationId = conversation.id
                newMessage.items.push({
                    type: 'TEXT',
                    content: userMessage.input,
                })
                await newMessage.save()

                const newModelMessage = new Message()
                newModelMessage.role = 'assistant'
                newModelMessage.items = []
                newModelMessage.conversationId = conversation.id
                newModelMessage.items.push({
                    type: 'TEXT',
                    content: response,
                })
                await newModelMessage.save()

                return newModelMessage
            case 'VEO':
                const generatedVideo = await this.geminiService.generateVideo(userMessage.input, {})

                const newUserMessage = await this.messageRepository
                    .create({
                        conversationId: conversation.id,
                        items: [
                            {
                                type: 'TEXT',
                                content: userMessage.input,
                            },
                        ],
                        role: 'user',
                    })
                    .save()

                const newAssistantMessage = await this.messageRepository
                    .create({
                        conversationId: conversation.id,
                        items: [
                            {
                                type: 'VIDEO',
                                content: generatedVideo,
                            },
                        ],
                        role: 'assistant',
                    })
                    .save()

                return newAssistantMessage

                break
            case 'KLING':
                const generatedKlingVideo = await this.klingService.generateVideo(userMessage.input, {})

                const newUserKlingMessage = await this.messageRepository
                    .create({
                        conversationId: conversation.id,
                        items: [
                            {
                                type: 'TEXT',
                                content: userMessage.input,
                            },
                        ],
                        role: 'user',
                    })
                    .save()

                const newAssistantKlingMessage = await this.messageRepository
                    .create({
                        conversationId: conversation.id,
                        items: [
                            {
                                type: 'VIDEO',
                                content: generatedKlingVideo,
                            },
                        ],
                        role: 'assistant',
                    })
                    .save()

                return newAssistantKlingMessage
        }
    }

    assembleGeminiChatHistory(messages: Message[]) {
        if (!messages) return []

        let history = []

        for (let message of messages) {
            history.push({
                role: message.role === 'assistant' ? 'model' : message.role,
                parts: [
                    {
                        text: message.items[0].content,
                    },
                ],
            })
        }

        return history
    }
}
