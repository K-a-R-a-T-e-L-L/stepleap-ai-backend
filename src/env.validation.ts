import * as Joi from 'joi'

export const validationSchema = Joi.object({
    DATABASE_HOST: Joi.string().hostname().required(),
    DATABASE_PORT: Joi.number().port().required(),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_DB: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().min(8).required(),
    JWT_ACCESS_SECRET: Joi.string().min(8).required(),
    JWT_ACCESS_EXPIRES: Joi.string()
        .pattern(/^\d+[smhdwy]$/)
        .required(),
    JWT_REFRESH_EXPIRES: Joi.string()
        .pattern(/^\d+[smhdwy]$/)
        .required(),
    TELEGRAM_TOKEN: Joi.string().required(),
    TELEGRAM_BOT_LAUNCH: Joi.string().valid('true', 'false').default('true'),
    TELEGRAM_ADMINCHAT_ID: Joi.string().required(),
    TELEGRAM_ADMIN_IDS: Joi.string().required(),
    YOOKASSA_SHOP_ID: Joi.string().required(),
    YOOKASSA_SECRET_KEY: Joi.string().required(),
    S3_ACCESS_KEY_ID: Joi.string().required(),
    S3_SECRET_ACCESS_KEY: Joi.string().required(),
    S3_URL: Joi.string().required(),
    S3_BUCKET: Joi.string().required(),
    OPENAI_API_KEY: Joi.string().allow('').required(),
    GPT_CHAT_MODEL: Joi.string().default('gpt-4o-mini'),
    GPT_CHAT_MAX_COMPLETION_TOKENS: Joi.number().integer().min(1).default(800),
    SORA_CHAT_MODEL: Joi.string().valid('sora-2', 'sora-2-pro').default('sora-2'),
    SORA_POLL_INTERVAL_MS: Joi.number().integer().min(5000).default(15000),
    SORA_TIMEOUT_MS: Joi.number().integer().min(60000).default(900000),
    SORA_PARALLEL_POLL_LIMIT: Joi.number().integer().min(1).max(20).default(5),
    FRONTEND_URL: Joi.string().required(),
    AUTOMATION_RETRY_ENABLED: Joi.string().valid('true', 'false').default('true'),
    AUTOMATION_RETRY_DELAY_MS: Joi.number().integer().min(1000).default(30000),
    AUTOMATION_RETRY_COOLDOWN_MS: Joi.number().integer().min(1000).default(300000),
    AUTOMATION_PENDING_TIMEOUT_MS: Joi.number().integer().min(10000).default(900000),
    AUTOMATION_PENDING_CHECK_INTERVAL_MS: Joi.number().integer().min(5000).default(60000),
    ENV: Joi.string().valid('dev', 'production').required(),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
})
