import { db } from '@/config/database';
import { executionLogs } from '@/db/schema';
import { getApp } from '@/apps/registry';
import { CredentialsService } from './credentials.service';
import { decrypt } from '@/utils/encryption';
import { APIError } from '@/utils/APIError';
import { logger } from '@/config/logger';
import config from '@/config';
import type { ExecutePayload, EncryptedExecuteRequest, ExecutionResult } from '@/types/apps.types';

/** Reject payloads older than 5 minutes to prevent replay attacks */
const PAYLOAD_MAX_AGE_MS = 5 * 60 * 1000;

export class ProcessorService {
  private static decryptPayload(request: EncryptedExecuteRequest): ExecutePayload {
    try {
      const raw = decrypt(
        { encrypted: request.payload, iv: request.iv, tag: request.tag },
        config.encryption.payloadKey
      );
      return JSON.parse(raw) as ExecutePayload;
    } catch {
      throw new APIError(400, 'Invalid or tampered encrypted payload');
    }
  }

  private static validateTimestamp(timestamp: number): void {
    const ageMs = Date.now() - timestamp * 1000;
    if (ageMs > PAYLOAD_MAX_AGE_MS || ageMs < -30_000) {
      throw new APIError(400, 'Payload timestamp is expired or out of bounds (replay attack protection)');
    }
  }

  private static logExecution(
    payload: ExecutePayload,
    status: 'SUCCESS' | 'FAILED',
    responseData: any,
    errorMessage: string | undefined,
    executionTimeMs: number
  ): void {
    db.insert(executionLogs)
      .values({
        userId: payload.userId,
        credentialId: payload.credentialId,
        appSlug: payload.appSlug,
        action: payload.action,
        status,
        requestPayload: { params: payload.params, requestId: payload.requestId },
        responsePayload: responseData ?? null,
        errorMessage: errorMessage ?? null,
        executionTimeMs,
      })
      .catch(err => {
        logger.error('Failed to write execution log', { error: err.message });
      });
  }

  static async execute(request: EncryptedExecuteRequest): Promise<ExecutionResult> {
    const startTime = Date.now();
    let payload: ExecutePayload | undefined;

    try {
      payload = this.decryptPayload(request);
      this.validateTimestamp(payload.timestamp);

      const app = getApp(payload.appSlug);
      if (!app) {
        throw new APIError(404, `App "${payload.appSlug}" not found`);
      }

      app.validateAction(payload.action);

      const credentials = await CredentialsService.getDecrypted(
        payload.credentialId,
        payload.userId
      );

      const data = await app.execute(payload.action, payload.params, credentials);
      const executionTimeMs = Date.now() - startTime;

      this.logExecution(payload, 'SUCCESS', data, undefined, executionTimeMs);

      return { success: true, data, executionTimeMs };
    } catch (error: any) {
      const executionTimeMs = Date.now() - startTime;

      if (payload) {
        this.logExecution(payload, 'FAILED', undefined, error.message, executionTimeMs);
      }

      logger.error('App execution failed', {
        appSlug: payload?.appSlug,
        action: payload?.action,
        error: error.message,
      });

      return { success: false, error: error.message, executionTimeMs };
    }
  }
}
