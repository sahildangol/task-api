# Task Management API

A Task Management API built with **Node.js**, **Express**, **Prisma**, **TypeScript**, **Zod**, and **PostgreSQL**.

## Features

- **JWT Authentication** — register and login endpoints; protected routes via `Authorization: Bearer <token>`
- **Task CRUD** — create, list, get by ID, update, delete (all scoped to the authenticated user)
- **Ownership Guards** — cross-user task access returns 403
- **Input Validation** — Zod schemas with `.strict()` rejecting unknown keys; `.refine()` rejecting empty PATCH body
- **Prisma Migrations** — declarative schema with `prisma migrate deploy` (not `db push`)
- **Structured Error Responses** — Prisma error codes mapped to HTTP statuses (P2002→409, P2025→404); generic 500s sanitized to `"Internal server error"`
- **Security Hardened** — `helmet`, strictly bound `cors` middleware, and `express-rate-limit` to protect auth endpoints.
- **Docker PostgreSQL & API** — Run everything beautifully from a single `docker compose up` command.

## Tech Stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| Runtime      | Node.js                                                 |
| Framework    | Express 5                                               |
| Language     | TypeScript                                              |
| ORM          | Prisma 7 (with `@prisma/adapter-pg` driver adapter)    |
| Validation   | Zod                                                     |
| Security     | Helmet, Express Rate Limit, CORS                        |
| Auth         | JSON Web Tokens (`jsonwebtoken`)                        |
| Database     | PostgreSQL 15 (via Docker)                              |

## Setup

### Quick Start (Docker)
This is the primary way to run the application for production or review.

1. **Configure Environment Variables**
   ```bash
   cp .env.sample .env
   ```
   *Edit `.env` and provide a secure value for `JWT_SECRET`.*

2. **Build and Start**
   ```bash
   docker compose up -d --build
   ```
   *Spins up PostgreSQL, runs migrations, seeds the DB, and starts the API.*

3. **Verify**
   ```bash
   curl http://localhost:5001/health
   # {"status":"ok"}
   ```

### Local Development
For active coding with hot-reload and local database connections.

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.sample .env
   ```
   *Edit `.env` — set `DB_HOST=localhost` when running locally, keep `DB_HOST=db` for Docker.*

3. **Start Local PostgreSQL**
   ```bash
   docker compose up -d db
   ```

4. **Run migrations & seed**
   ```bash
   pnpm prisma:migrate:deploy
   pnpm db:seed
   ```

5. **Start the dev server**
   ```bash
   pnpm dev
   ```

## API Reference

Base URL: `http://localhost:5001`

### Health Check

| Endpoint  | Method | Description                  | Auth Required |
| --------- | ------ | ---------------------------- | ------------- |
| `/health` | GET    | Lightweight liveness probe   | No            |

### Authentication

| Endpoint       | Method | Description          | Auth Required |
| -------------- | ------ | -------------------- | ------------- |
| `/api/auth/register` | POST   | Create a new user    | No            |
| `/api/auth/login`    | POST   | Authenticate and get JWT | No        |

#### POST `/api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "User Name"
}
```

**Responses:** `201 Created` on success, `409 Conflict` on duplicate email, `400 Bad Request` on validation errors (missing fields, short password, unknown keys, invalid email).

#### POST `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Responses:** `200 OK` on success (returns JWT + user), `401 Unauthorized` on invalid credentials or non-existent email.

### Tasks (All task endpoints require `Authorization: Bearer <token>`)

| Endpoint        | Method | Description            |
| --------------- | ------ | ---------------------- |
| `/api/tasks`    | POST   | Create a new task      |
| `/api/tasks`    | GET    | List all user's tasks  |
| `/api/tasks/:id` | GET   | Get task by ID         |
| `/api/tasks/:id` | PATCH | Update task            |
| `/api/tasks/:id` | DELETE| Delete task            |

#### POST `/api/tasks`

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

#### PATCH `/api/tasks/:id`

**Request Body** (at least one field required):
```json
{
  "title": "Updated title",
  "isCompleted": true
}
```

### Error Response Format

All errors follow a consistent shape:
```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

In development mode (`NODE_ENV=development`), a `stack` field is also included.

### Rate Limiting

Authentication endpoints (`/api/auth/*`) are rate-limited to **10 requests per 15-minute window** per IP. Exceeding the limit returns a `429` response:
```json
{
  "success": false,
  "error": {
    "message": "Too many requests from this IP, please try again after 15 minutes"
  }
}
```

## Security

- **Helmet** — sets secure HTTP headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.)
- **CORS** — restricted to `GET`, `POST`, `PATCH`, `DELETE` methods
- **Request size limit** — JSON and URL-encoded bodies are capped at **10 KB**
- **Trust proxy** — `app.set('trust proxy', 1)` for correct IP behind reverse proxies
- **Rate limiting** — auth endpoints protected from brute-force (see above)

## Server & Process Management

- **Graceful shutdown** — the server listens for `SIGTERM` and `SIGINT`, closes the HTTP server, disconnects Prisma, and exits cleanly. Docker `stop` / `down` sends `SIGTERM`.
- **Safety nets** — unhandled promise rejections and uncaught exceptions trigger a clean `process.exit(1)` to avoid undefined state.
- **Database URL** — composed at runtime from `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, and `DB_NAME`; set via `.env` or Docker Compose `environment`.

## Migration Workflow

```bash
# Create a new migration after schema changes
pnpm prisma:migrate:dev --name description_of_changes

# Deploy migrations (for CI/CD / production)
pnpm prisma:migrate:deploy
```

If you modify `prisma/schema.prisma`:
1. `prisma:migrate:dev` creates a migration file + applies it to the local DB
2. Commit the generated migration file
3. In production/staging, `prisma:migrate:deploy` applies pending migrations

## Project Structure

```text
task-api/
├── prisma/
│   ├── schema.prisma      # Data model
│   ├── seed.ts            # Database seeder
│   └── migrations/        # Migration history
├── src/
│   ├── app.ts             # Express app setup
│   ├── index.ts           # Server entry point
│   ├── config/
│   │   ├── env.ts         # Environment variable validation
│   │   └── db.ts          # Prisma client singleton
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT auth guard
│   │   ├── error.middleware.ts # Global error handler
│   │   └── validate.ts        # Zod validation middleware
│   ├── schemas/
│   │   ├── auth.schema.ts     # Auth request schemas
│   │   └── task.schema.ts     # Task request schemas
│   ├── services/
│   │   ├── auth.service.ts    # Auth business logic
│   │   └── task.service.ts    # Task CRUD + ownership logic
│   ├── controllers/
│   │   ├── auth.controller.ts # Auth request handlers
│   │   └── task.controller.ts # Task request handlers
│   ├── routes/
│   │   ├── auth.routes.ts     # Auth route definitions
│   │   └── task.routes.ts     # Task route definitions
│   ├── types/
│   │   └── express/
│   │       └── index.d.ts     # Express type augmentation
│   └── utils/
│       ├── AppError.ts        # Custom error class
│       └── successResponse.ts # Response helper
├── api-tests.http          # Manual test collection
├── docker-compose.yml      # Docker services
├── Dockerfile              # Production build
├── docker-entrypoint.sh    # Container entrypoint
└── package.json
```
