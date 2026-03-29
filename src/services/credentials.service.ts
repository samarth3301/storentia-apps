import { db } from '@/config/database';
import { appCredentials } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { encryptObject, decryptObject } from '@/utils/encryption';
import { getApp } from '@/apps/registry';
import { APIError } from '@/utils/APIError';
import config from '@/config';
import type { AppCredential } from '@/db/schema';

export interface CreateCredentialInput {
  userId: string;
  appSlug: string;
  name: string;
  credentials: Record<string, string>;
}

export interface UpdateCredentialInput {
  name?: string;
  credentials?: Record<string, string>;
}

export type SafeCredential = Omit<AppCredential, 'encryptedData' | 'encryptionIv' | 'encryptionTag'>;

export class CredentialsService {
  static async create(input: CreateCredentialInput): Promise<SafeCredential> {
    const app = getApp(input.appSlug);
    if (!app) {
      throw new APIError(404, `App "${input.appSlug}" not found`);
    }

    app.validateCredentials(input.credentials);

    const existing = await db.query.appCredentials.findFirst({
      where: and(
        eq(appCredentials.userId, input.userId),
        eq(appCredentials.appSlug, input.appSlug),
        eq(appCredentials.name, input.name)
      ),
    });

    if (existing) {
      throw new APIError(409, `A credential named "${input.name}" already exists for app "${input.appSlug}"`);
    }

    const { encrypted, iv, tag } = encryptObject(input.credentials, config.encryption.credentialKey);

    const [credential] = await db
      .insert(appCredentials)
      .values({
        userId: input.userId,
        appSlug: input.appSlug,
        name: input.name,
        encryptedData: encrypted,
        encryptionIv: iv,
        encryptionTag: tag,
      })
      .returning();

    const { encryptedData, encryptionIv, encryptionTag, ...safe } = credential;
    return safe;
  }

  static async listByUser(userId: string, appSlug?: string): Promise<SafeCredential[]> {
    const where = appSlug
      ? and(eq(appCredentials.userId, userId), eq(appCredentials.appSlug, appSlug))
      : eq(appCredentials.userId, userId);

    const results = await db.query.appCredentials.findMany({ where });

    return results.map(({ encryptedData, encryptionIv, encryptionTag, ...safe }) => safe);
  }

  static async getDecrypted(credentialId: string, userId: string): Promise<Record<string, string>> {
    const credential = await db.query.appCredentials.findFirst({
      where: and(
        eq(appCredentials.id, credentialId),
        eq(appCredentials.userId, userId),
        eq(appCredentials.isActive, true)
      ),
    });

    if (!credential) {
      throw new APIError(404, 'Credential not found or inactive');
    }

    // Fire-and-forget lastUsedAt update
    db.update(appCredentials)
      .set({ lastUsedAt: new Date() })
      .where(eq(appCredentials.id, credentialId))
      .catch(() => {});

    return decryptObject<Record<string, string>>(
      {
        encrypted: credential.encryptedData,
        iv: credential.encryptionIv,
        tag: credential.encryptionTag,
      },
      config.encryption.credentialKey
    );
  }

  static async update(
    credentialId: string,
    userId: string,
    input: UpdateCredentialInput
  ): Promise<SafeCredential> {
    const credential = await db.query.appCredentials.findFirst({
      where: and(
        eq(appCredentials.id, credentialId),
        eq(appCredentials.userId, userId)
      ),
    });

    if (!credential) {
      throw new APIError(404, 'Credential not found');
    }

    const updateData: Partial<typeof appCredentials.$inferInsert> = {};

    if (input.name) updateData.name = input.name;

    if (input.credentials) {
      const app = getApp(credential.appSlug);
      if (app) app.validateCredentials(input.credentials);

      const { encrypted, iv, tag } = encryptObject(input.credentials, config.encryption.credentialKey);
      updateData.encryptedData = encrypted;
      updateData.encryptionIv = iv;
      updateData.encryptionTag = tag;
    }

    const [updated] = await db
      .update(appCredentials)
      .set(updateData)
      .where(eq(appCredentials.id, credentialId))
      .returning();

    const { encryptedData, encryptionIv, encryptionTag, ...safe } = updated;
    return safe;
  }

  static async delete(credentialId: string, userId: string): Promise<void> {
    const [deleted] = await db
      .delete(appCredentials)
      .where(and(eq(appCredentials.id, credentialId), eq(appCredentials.userId, userId)))
      .returning();

    if (!deleted) {
      throw new APIError(404, 'Credential not found');
    }
  }
}
