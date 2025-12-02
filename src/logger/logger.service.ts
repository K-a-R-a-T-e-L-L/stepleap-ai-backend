import { Injectable, LoggerService, Scope, Inject } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf'

export interface TelegramLoggerConfig {
    chatId: string;
    logLevels?: ('log' | 'error' | 'warn' | 'debug' | 'verbose')[];
    appName?: string;
    enableConsoleLog?: boolean;
}

@Injectable({ scope: Scope.TRANSIENT })
export class TelegramLoggerService implements LoggerService {
    private context?: string;
    private config: TelegramLoggerConfig;

    constructor(
        @InjectBot() private readonly bot: Telegraf,
        @Inject('TELEGRAM_LOGGER_CONFIG') config: TelegramLoggerConfig,
    ) {
        this.config = {
            logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
            appName: 'App',
            enableConsoleLog: true,
            ...config,
        };
    }

    setContext(context: string) {
        this.context = context;
    }

    log(message: any, context?: string) {
        this.printMessage(message, 'log', context);
    }

    error(message: any, trace?: string, context?: string) {
        this.printMessage(message, 'error', context, trace);
    }

    warn(message: any, context?: string) {
        this.printMessage(message, 'warn', context);
    }

    debug(message: any, context?: string) {
        this.printMessage(message, 'debug', context);
    }

    verbose(message: any, context?: string) {
        this.printMessage(message, 'verbose', context);
    }

    private printMessage(
        message: any,
        logLevel: string,
        context?: string,
        trace?: string,
    ) {
        const ctx = context || this.context || 'Application';
        const formattedMessage = this.formatMessage(message, logLevel, ctx, trace);

        // Console logging
        if (this.config.enableConsoleLog) {
            const consoleMethod = logLevel === 'error' ? 'error' :
                logLevel === 'warn' ? 'warn' : 'log';
            console[consoleMethod](formattedMessage);
        }

        // Telegram logging
        if (this.config.logLevels?.includes(logLevel as any)) {
            this.sendToTelegram(formattedMessage, logLevel);
        }
    }

    private formatMessage(
        message: any,
        logLevel: string,
        context: string,
        trace?: string,
    ): string {
        const timestamp = new Date().toISOString();
        const emoji = this.getEmojiForLevel(logLevel);

        let formattedMsg = `${emoji} <b>[${this.config.appName}]</b> ${timestamp} <b>[${logLevel.toUpperCase()}]</b> <code>[${context}]</code>\n\n`;

        if (typeof message === 'object') {
            // Format JSON with HTML <pre> and <code> tags for pretty formatting
            const jsonString = JSON.stringify(message, null, 2);
            formattedMsg += `<pre><code class="language-json">${this.escapeHtml(jsonString)}</code></pre>`;
        } else {
            formattedMsg += this.escapeHtml(String(message));
        }

        if (trace) {
            formattedMsg += `\n\n<b>Stack Trace:</b>\n<pre><code>${this.escapeHtml(trace)}</code></pre>`;
        }

        return formattedMsg;
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    private getEmojiForLevel(logLevel: string): string {
        const emojiMap: Record<string, string> = {
            log: 'ℹ️',
            error: '🚨',
            warn: '⚠️',
            debug: '🐛',
            verbose: '📝',
        };
        return emojiMap[logLevel] || '📌';
    }

    private async sendToTelegram(message: string, logLevel: string) {
        try {
            // Telegram has a 4096 character limit per message
            const chunks = this.splitMessage(message, 4000);

            for (const chunk of chunks) {
                await this.bot.telegram.sendMessage(this.config.chatId, chunk, {
                    parse_mode: 'HTML',
                });
            }
        } catch (error) {
            // Avoid infinite loop by not using the logger here
            console.error('Failed to send log to Telegram:', error.message);
        }
    }

    private splitMessage(message: string, maxLength: number): string[] {
        const chunks: string[] = [];
        let remaining = message;

        while (remaining.length > maxLength) {
            let chunk = remaining.substring(0, maxLength);
            const lastNewline = chunk.lastIndexOf('\n');

            if (lastNewline > maxLength * 0.5) {
                chunk = remaining.substring(0, lastNewline);
                remaining = remaining.substring(lastNewline + 1);
            } else {
                remaining = remaining.substring(maxLength);
            }

            chunks.push(chunk);
        }

        if (remaining) {
            chunks.push(remaining);
        }

        return chunks;
    }
}