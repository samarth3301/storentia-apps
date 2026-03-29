import type { AppMeta, ActionDefinition } from '@/types/apps.types';
import { APIError } from '@/utils/APIError';

export abstract class BaseApp {
  abstract readonly meta: AppMeta;

  abstract execute(
    action: string,
    params: Record<string, any>,
    credentials: Record<string, string>
  ): Promise<any>;

  getAction(actionName: string): ActionDefinition | undefined {
    return this.meta.actions[actionName];
  }

  validateAction(action: string): void {
    if (!this.meta.actions[action]) {
      throw new APIError(400, `Action "${action}" is not supported by app "${this.meta.slug}"`);
    }
  }

  validateCredentials(credentials: Record<string, string>): void {
    const missing = this.meta.requiredCredentials
      .filter(field => field.required && !credentials[field.key])
      .map(field => field.key);

    if (missing.length > 0) {
      throw new APIError(400, `Missing required credentials for app "${this.meta.slug}": ${missing.join(', ')}`);
    }
  }
}
