# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Development server with nodemon (ts-node)
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled output (requires build first)
npm run lint         # Biome linter + formatter check
npm run test         # Run all Jest tests
npm run test:watch   # Jest watch mode
npm run test:coverage # Jest with coverage report

# Run a single test file
npx jest path/to/file.test.ts

# Database migrations
npx drizzle-kit generate   # Generate migration from schema changes
npx drizzle-kit migrate    # Apply pending migrations

# Docker
npm run docker:compose:up    # Start full stack (app + postgres + redis)
npm run docker:compose:down  # Stop all services
```

## Architecture

This is a multi-tenant app-integration backend. Its core purpose: authenticated users store encrypted third-party credentials (Stripe keys, Razorpay keys, etc.), and a privileged service caller triggers execution of those credentials against payment/shipping APIs.

### Request Flow

```
External Service → POST /v1/apps/execute (X-Service-Key + AES-encrypted payload)
                 → processor.service.ts decrypts payload, fetches user credentials
                 → App registry resolves the correct app handler
                 → App executes action against third-party API
                 → Result logged to executionLogs table
```

### Key Architectural Concepts

**App Registry Pattern** (`src/apps/registry.ts`): All integrations (Stripe, Razorpay, Shiprocket, Webhook) implement `BaseApp` (`src/apps/base.app.ts`) with `meta`, `execute()`, and validation methods. Adding a new integration = create a class extending `BaseApp`, register it.

**Two Auth Layers:**
1. User auth — JWT Bearer tokens (access + refresh) for user-facing CRUD endpoints
2. Service auth — `X-Service-Key` header for server-to-server execution calls; payloads are AES-256-GCM encrypted with `PAYLOAD_ENCRYPTION_KEY`

**Credential Storage** (`src/services/credentials.service.ts`): Third-party API keys are stored encrypted (AES-256-GCM) in `appCredentials` table with separate `encryptedData`, `iv`, and `authTag` columns. Key: `CREDENTIAL_ENCRYPTION_KEY`.

**Centralized Config** (`src/config/index.ts`): All env vars are validated and exported from here. If required vars are missing, the process exits on startup.

### Module Path Aliases

`@/` maps to `src/` — configured in `tsconfig.json` and `module-alias` (required at runtime via `-r module-alias/register`).

### Database Schema (`src/db/schema.ts`)

- `users` — roles: `ADMIN | USER`; status: `ACTIVE | INACTIVE | SUSPENDED`
- `appCredentials` — encrypted third-party credentials per user per app
- `executionLogs` — audit trail for all app executions; status: `SUCCESS | FAILED | PENDING`

### Environment Variables

Required (process exits if missing):
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET`
- `SERVICE_API_KEY` — for service-to-service auth
- `PAYLOAD_ENCRYPTION_KEY` — 64 hex chars (32 bytes)
- `CREDENTIAL_ENCRYPTION_KEY` — 64 hex chars (32 bytes)

See `.example.env` for all variables with defaults.
