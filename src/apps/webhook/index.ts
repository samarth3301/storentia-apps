import { BaseApp } from '@/apps/base.app';
import type { AppMeta } from '@/types/apps.types';
import { APIError } from '@/utils/APIError';
import { httpRequest } from './actions/request';
import type { WebhookCredentials } from './types';

class WebhookApp extends BaseApp {
  readonly meta: AppMeta = {
    slug: 'http',
    name: 'HTTP / Webhook',
    description: 'Make HTTP requests to any REST API or webhook endpoint',
    category: 'developer',
    requiredCredentials: [
      {
        key: 'base_url',
        label: 'Base URL',
        type: 'url',
        required: false,
        description: 'Optional base URL to prepend to relative paths',
      },
      { key: 'bearer_token', label: 'Bearer Token', type: 'password', required: false },
      { key: 'api_key', label: 'API Key Value', type: 'password', required: false },
      {
        key: 'api_key_header',
        label: 'API Key Header Name',
        type: 'text',
        required: false,
        description: 'Header name to send the API key in (e.g. X-API-Key)',
      },
      {
        key: 'custom_headers',
        label: 'Custom Headers (JSON)',
        type: 'text',
        required: false,
        description: 'JSON object of additional headers, e.g. {"X-Foo": "bar"}',
      },
    ],
    actions: {
      request: {
        name: 'HTTP Request',
        description: 'Make a GET, POST, PUT, PATCH, or DELETE request',
        params: [
          { key: 'url', label: 'URL', type: 'string', required: true },
          { key: 'method', label: 'HTTP Method', type: 'string', required: false, description: 'GET | POST | PUT | PATCH | DELETE (default: GET)' },
          { key: 'headers', label: 'Request Headers', type: 'object', required: false },
          { key: 'body', label: 'Request Body', type: 'object', required: false },
          { key: 'timeout', label: 'Timeout (ms)', type: 'number', required: false, description: 'Default: 30000' },
        ],
      },
    },
  };

  async execute(
    action: string,
    params: Record<string, any>,
    credentials: Record<string, string>
  ): Promise<any> {
    this.validateAction(action);

    const creds = credentials as unknown as WebhookCredentials;

    switch (action) {
      case 'request': return httpRequest(params as any, creds);
      default: throw new APIError(400, `Unknown action: ${action}`);
    }
  }
}

export default new WebhookApp();
