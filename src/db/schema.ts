import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  text,
  boolean,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';

// ── Enums ──────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'USER']);
export const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'INACTIVE', 'SUSPENDED']);
export const executionStatusEnum = pgEnum('execution_status', ['SUCCESS', 'FAILED', 'PENDING']);

// ── Users ──────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('USER').notNull(),
  status: userStatusEnum('status').default('ACTIVE').notNull(),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ── App Credentials ────────────────────────────────────────────────────────
// Stores users' third-party API keys encrypted at rest with AES-256-GCM.

export const appCredentials = pgTable('app_credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  appSlug: varchar('app_slug', { length: 100 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  encryptedData: text('encrypted_data').notNull(),
  encryptionIv: varchar('encryption_iv', { length: 64 }).notNull(),
  encryptionTag: varchar('encryption_tag', { length: 64 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export type AppCredential = typeof appCredentials.$inferSelect;
export type NewAppCredential = typeof appCredentials.$inferInsert;

// ── Execution Logs ─────────────────────────────────────────────────────────
// Audit trail for every app action executed via the processor.

export const executionLogs = pgTable('execution_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  credentialId: uuid('credential_id').references(() => appCredentials.id, {
    onDelete: 'set null',
  }),
  appSlug: varchar('app_slug', { length: 100 }).notNull(),
  action: varchar('action', { length: 255 }).notNull(),
  status: executionStatusEnum('status').notNull(),
  requestPayload: jsonb('request_payload'),
  responsePayload: jsonb('response_payload'),
  errorMessage: text('error_message'),
  executionTimeMs: integer('execution_time_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ExecutionLog = typeof executionLogs.$inferSelect;
export type NewExecutionLog = typeof executionLogs.$inferInsert;
