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
   *This command will automatically spin up PostgreSQL, wait for it to become healthy, run database migrations, seed the database, and start the compiled API.*

3. **Verify**
   Check that the server is alive and well:
   http://localhost:5000/health

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
   *Edit `.env` and ensure `DATABASE_URL` is pointing to `localhost` (e.g. `postgresql://postgres:your_password@localhost:5432/task_manager_db`).*

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

Base URL: `http://localhost:5000`

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

**Responses:** `201 Created` on success, `409 Conflict` on duplicate email, `400 Bad Request` on validation errors.

#### POST `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Responses:** `200 OK` on success (returns JWT token), `401 Unauthorized` on invalid credentials.

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

All errors return:
```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

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
