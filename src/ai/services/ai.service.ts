import OpenAI from 'openai'
import { Observable } from 'rxjs'
import { User } from '../../system/user/entity/user.entity'
import { UsageStatistics } from '../entities/usage-statistics.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Conversation } from '../entities/conversation.entity'
import { Repository } from 'typeorm'

export class AiService {
    private readonly client: OpenAI

    constructor(@InjectRepository(Conversation) private readonly convoRepository: Repository<Conversation>) {
        this.client = new OpenAI()
    }

    async streamResponse(user: User, model: string, prompt: string): Promise<Observable<MessageEvent>> {
        const conversation = await this.convoRepository.findOneBy({ userId: user.id })
        let history = []

        // if (conversation) {
        //     history = JSON.parse(conversation.history)
        // }

        // const usageStatistics = new UsageStatistics()
        // usageStatistics.user = user
        // usageStatistics.userId = user.uuid
        // usageStatistics.model = model
        // usageStatistics.prompt = prompt

        return new Observable((subscriber) => {
            ;(async () => {
                try {
                    const stream = await this.client.responses.create({
                        model: model,
                        input: history,
                        stream: true,
                    })

                    for await (const event of stream) {
                        if (event.type === 'response.output_text.delta') {
                            if (event.delta) {
                                subscriber.next({
                                    data: event.delta,
                                } as MessageEvent)
                            }
                        }

                        if (event.type === 'response.completed') {
                            // usageStatistics.inputTokens = event.response.usage.input_tokens
                            // usageStatistics.outputTokens = event.response.usage.output_tokens
                            // usageStatistics.save()

                            subscriber.next({
                                data: { done: true },
                            } as MessageEvent)

                            subscriber.complete()
                        }

                        if (event.type === 'response.output_text.done') {
                            // usageStatistics.outputText = event.text
                        }

                        if (event.type === 'error') {
                            console.error(event)
                        }
                    }
                } catch (error) {
                    subscriber.error(error)
                }
            })()
        })
    }

    async create(model: string, input: string | any[]) {
        return this.client.responses.create({
            model: model,
            input: input,
        })
    }
}
