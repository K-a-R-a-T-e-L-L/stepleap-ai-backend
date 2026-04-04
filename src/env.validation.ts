import * as Joi from 'joi'

export const validationSchema = Joi.object({
    DATABASE_HOST: Joi.string().hostname().required(),
    DATABASE_PORT: Joi.number().port().required(),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_DB: Joi.string().required(),
    DATABASE_LOGGING: Joi.string().valid('true', 'false').default('false'),
    DATABASE_SYNCHRONIZE: Joi.string().valid('true', 'false').default('true'),
    JWT_REFRESH_SECRET: Joi.string().min(8).required(),
    JWT_ACCESS_SECRET: Joi.string().min(8).required(),
    JWT_ACCESS_EXPIRES: Joi.string()
        .pattern(/^\d+[smhdwy]$/)
        .required(),
    JWT_REFRESH_EXPIRES: Joi.string()
        .pattern(/^\d+[smhdwy]$/)
        .required(),
    TELEGRAM_TOKEN: Joi.string().required(),
    TELEGRAM_ADMINCHAT_ID: Joi.string().required(),
    FRONTEND_URL: Joi.string().required(),
    OLLAMA_BASE_URL: Joi.string().uri().allow('').optional(),
    OLLAMA_API_KEY: Joi.string().allow('').optional(),
    OLLAMA_MODEL: Joi.string().default('qwen3:0.6b'),
    GROQ_API_KEY: Joi.string().allow('').optional(),
    GROQ_MODEL: Joi.string().default('llama-3.3-70b-versatile'),
    GEMINI_API_KEY: Joi.string().allow('').optional(),
    GEMINI_MODEL: Joi.string().default('models/gemini-2.5-flash'),
    REMOTE_OK_API_URL: Joi.string().uri().default('https://remoteok.com/api'),
    REMOTE_OK_SYNC_LIMIT: Joi.number().integer().min(1).max(200).default(25),
    REMOTE_OK_SYNC_INTERVAL_MS: Joi.number().integer().min(1000).default(900000),
    LLM_NORMALIZE_LIMIT: Joi.number().integer().min(0).max(50).default(1),
    LLM_TIMEOUT_MS: Joi.number().integer().min(1000).default(120000),
    ENV: Joi.string().valid('dev', 'production').required(),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
})
