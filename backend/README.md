# Government Exam Execution Platform — Backend

> Production-grade TypeScript REST API for managing government exam lifecycles, push notifications, and mobile delivery.

---

## 🏗️ Architecture Overview

```
src/
├── config/          # Env, Prisma, Redis singletons
├── middleware/       # Auth, validation, error handling
├── schemas/          # Zod request schemas (DTOs)
├── services/         # Business logic layer
├── controllers/      # HTTP request handlers
├── routes/           # Express route definitions
├── queues/           # BullMQ queue definitions
├── workers/          # BullMQ job processors
└── utils/            # Logger, cache, slugify, API response

prisma/
├── schema.prisma     # Full data model
└── seed.ts           # Sample data seeder
```

---

## 📦 Tech Stack

| Concern | Technology |
|---|---|
| Runtime | Node.js v22 + TypeScript |
| Framework | Express.js v5 |
| ORM | Prisma v6 (PostgreSQL) |
| Cache | Redis (IORedis) |
| Job Queue | BullMQ |
| Validation | Zod |
| Logging | Winston |
| Push Notifications | FCM (firebase-admin) |

---

## 🗄️ Database Models

| Model | Purpose |
|---|---|
| `Exam` | Core exam entity (title, category, vacancy, links) |
| `LifecycleEvent` | Timeline milestones per exam (registration, admit card, result…) |
| `PushToken` | Device push tokens registered by mobile app |
| `NotificationLog` | Full audit of every push notification attempt |
| `AdminAuditLog` | Admin mutation audit trail |

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
# Edit .env — set DATABASE_URL, Redis config, and API_KEY_SECRET
```

### 4. Run database migrations

```bash
npm run prisma:migrate
```

### 5. Seed sample data (optional)

```bash
npm run prisma:seed
```

### 6. Start the dev server

```bash
npm run dev
```

Server starts at: `http://localhost:8080`

---

## 📡 API Endpoints

### Public (Mobile App)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/health` | Health check (DB + Redis) |
| GET | `/api/v1/exams` | List exams (paginated, filterable) |
| GET | `/api/v1/exams/:id` | Get exam by ID |
| GET | `/api/v1/exams/slug/:slug` | Get exam by slug |
| GET | `/api/v1/exams/:id/timeline` | Full lifecycle timeline |
| POST | `/api/v1/push-tokens/register` | Register device push token |
| POST | `/api/v1/push-tokens/deactivate` | Deactivate push token |

### Admin (API Key protected)

Add headers: `X-API-Key: <API_KEY_SECRET>` and `X-Admin-ID: <admin-user-id>`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/exams` | Create exam (UC-01) |
| PATCH | `/api/v1/exams/:id` | Update exam |
| DELETE | `/api/v1/exams/:id` | Delete exam |
| POST | `/api/v1/exams/:id/events` | Add lifecycle event (UC-02) |
| PATCH | `/api/v1/exams/:id/events/:eventId` | Update lifecycle event |
| DELETE | `/api/v1/exams/:id/events/:eventId` | Delete lifecycle event |

---

## 🔔 Notification System

- Adding a lifecycle event **automatically queues** a BullMQ job
- The job fires at `scheduledAt` time (delayed jobs)
- The worker fetches all active device tokens and sends FCM push notifications
- Every notification attempt is logged in `NotificationLog`
- Idempotency: if a notification was already sent, the job is skipped

### FCM Setup

1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Set `FCM_PROJECT_ID`, `FCM_CLIENT_EMAIL`, `FCM_PRIVATE_KEY` in `.env`

---

## 🔑 Exam Query Filters

```
GET /api/v1/exams?category=UPSC&status=ACTIVE&page=1&limit=20&search=civil
```

**Supported categories:** `UPSC`, `SSC`, `BANKING`, `RAILWAY`, `DEFENCE`, `STATE_PSC`, `TEACHING`, `POLICE`, `OTHER`  
**Supported statuses:** `UPCOMING`, `ACTIVE`, `COMPLETED`, `CANCELLED`

---

## 🕐 Lifecycle Event Types

| Type | Description |
|---|---|
| `NOTIFICATION_OUT` | Official advertisement released |
| `REGISTRATION_START` | Application window opens |
| `REGISTRATION_END` | Application deadline |
| `CORRECTION_WINDOW_START` | Edit window opens |
| `CORRECTION_WINDOW_END` | Edit window closes |
| `ADMIT_CARD_RELEASE` | Hall ticket available |
| `EXAM_DATE` | Actual exam date |
| `ANSWER_KEY_RELEASE` | Answer key published |
| `RESULT_DECLARED` | Final result published |
| `CUTOFF_RELEASE` | Cut-off marks published |
| `INTERVIEW_DATE` | Interview / DV date |
| `JOINING_DATE` | Posting / joining date |
| `OTHER` | Any other milestone |

---

## 🛠️ Scripts

```bash
npm run dev          # Dev server with hot reload
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled production build
npm run typecheck    # Type-check without emitting

npm run prisma:generate  # Regenerate Prisma client
npm run prisma:migrate   # Run migrations (dev)
npm run prisma:push      # Push schema without migration
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed sample data
```
