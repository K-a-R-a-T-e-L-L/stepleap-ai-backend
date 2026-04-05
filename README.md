# StepLeap AI Backend

Backend API for StepLeap AI: authentication, user profile, AI recommendations, track checkpoints (episodes), and vacancy matching.

<details open>
<summary><strong>Русский</strong></summary>

## О проекте

`stepleap-ai-backend` — серверная часть StepLeap AI (NestJS + PostgreSQL).

Backend отвечает за:

- авторизацию пользователя (в т.ч. Telegram Mini App сценарии)
- хранение анкеты и карьерного профиля
- AI-генерацию рекомендаций (треки, навыки, чекпоинты)
- кэширование AI-результатов в БД
- подбор и матчинг вакансий
- фиксацию прогресса по эпизодам

## Ключевые возможности

- REST API с Swagger
- Хранение данных в PostgreSQL через TypeORM
- Career Engine:
  - рекомендации треков
  - оценка soft/hard skills
  - генерация checkpoint’ов
  - прогресс по шагам
- Vacancy Engine:
  - синхронизация вакансий из публичного фида
  - расчет соответствия профилю
  - план усиления по gap’ам
- Защита от лишней нагрузки:
  - кэш AI-результатов
  - обновление только при изменении профиля
  - лимиты и таймауты на LLM-запросы

## Технологии

- NestJS 10
- TypeScript
- PostgreSQL
- TypeORM
- Swagger (`@nestjs/swagger`)
- OpenAI SDK
- Telegraf / Telegram integration

## Быстрый старт

```bash
npm install
cp .env.example .env
npm run start:dev
```

Сервер по умолчанию: `http://localhost:4000`.

Swagger: `http://localhost:4000/api/docs` (если включен в текущей сборке).

## Production

```bash
npm run build
npm run start:prod
```

## Основные переменные окружения

Пример смотри в `.env.example`.

Ключевые группы:

- База данных:
  - `DATABASE_HOST`
  - `DATABASE_PORT`
  - `DATABASE_USER`
  - `DATABASE_PASSWORD`
  - `DATABASE_DB`
- Auth/JWT:
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `JWT_ACCESS_EXPIRES`
  - `JWT_REFRESH_EXPIRES`
- Telegram:
  - `TELEGRAM_TOKEN`
  - `TELEGRAM_ADMINCHAT_ID`
- CORS/Frontend:
  - `FRONTEND_URL`
  - `CORS_ORIGINS`
- AI:
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`
  - `OPENAI_ORG_ID`
  - `OPENAI_BASE_URL`
  - `AI_DISABLED`
- LLM-регулировка:
  - `LLM_TIMEOUT_MS`
  - `LLM_MIN_INTERVAL_MS`
  - `LLM_MAX_RETRIES`
  - `LLM_RETRY_BASE_MS`
  - `LLM_DEBUG_RAW`
- Вакансии:
  - `REMOTE_OK_API_URL`
  - `REMOTE_OK_SYNC_LIMIT`
  - `REMOTE_OK_SYNC_INTERVAL_MS`

## Скрипты

- `npm run start` — запуск
- `npm run start:dev` — dev watch
- `npm run start:debug` — debug watch
- `npm run build` — сборка
- `npm run start:prod` — production запуск из `dist`
- `npm run lint` — линтер
- `npm run test` / `test:e2e` / `test:cov` — тесты

## Бизнес-логика (в двух словах)

1. Пользователь обновляет анкету.
2. Backend помечает профиль как измененный.
3. AI-рекомендации пересчитываются и сохраняются в БД.
4. Пока профиль не меняется — данные отдаются из кэша.
5. Эпизоды и прогресс сохраняются, чтобы состояние не терялось после перезагрузки.

</details>

<details>
<summary><strong>English</strong></summary>

## About

`stepleap-ai-backend` is the NestJS API layer for StepLeap AI.

It provides:

- authentication (including Telegram Mini App scenarios)
- onboarding/profile persistence
- AI-powered recommendations (tracks, skills, checkpoints)
- DB caching for AI outputs
- vacancy sync and profile matching
- episode progress tracking

## Core Features

- REST API with Swagger
- PostgreSQL + TypeORM
- Career engine:
  - track recommendations
  - soft/hard skill scoring
  - dynamic checkpoint generation
  - progress tracking
- Vacancy engine:
  - external feed sync
  - fit-score matching
  - gap-based action plan
- Load and cost control:
  - cached AI results
  - recompute only after profile changes
  - LLM rate limits/timeouts/retries

## Tech Stack

- NestJS 10
- TypeScript
- PostgreSQL
- TypeORM
- Swagger (`@nestjs/swagger`)
- OpenAI SDK
- Telegraf / Telegram integration

## Quick Start

```bash
npm install
cp .env.example .env
npm run start:dev
```

Default API URL: `http://localhost:4000`.

Swagger: `http://localhost:4000/api/docs` (if enabled in current build).

## Production

```bash
npm run build
npm run start:prod
```

## Environment Variables

See `.env.example` for a full template.

Main groups:

- Database (`DATABASE_*`)
- Auth/JWT (`JWT_*`)
- Telegram (`TELEGRAM_*`)
- CORS/Frontend (`FRONTEND_URL`, `CORS_ORIGINS`)
- AI (`OPENAI_*`, `AI_DISABLED`)
- LLM throttling (`LLM_*`)
- Vacancy feed (`REMOTE_OK_*`)

## Scripts

- `npm run start`
- `npm run start:dev`
- `npm run start:debug`
- `npm run build`
- `npm run start:prod`
- `npm run lint`
- `npm run test` / `test:e2e` / `test:cov`

## Runtime Flow (short)

1. User updates profile.
2. Backend marks profile as changed.
3. AI outputs are regenerated and persisted.
4. Cached data is reused while profile is unchanged.
5. Episode progress is stored server-side to persist across reloads.

</details>
