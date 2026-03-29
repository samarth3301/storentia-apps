import type { WebhookCredentials, HttpRequestParams } from '../types';
import { APIError } from '@/utils/APIError';

export async function httpRequest(
  params: HttpRequestParams,
  credentials: WebhookCredentials
): Promise<any> {
  const method = params.method ?? 'GET';
  const timeout = params.timeout ?? 30000;

  // Resolve URL — prepend base_url if provided and the url is a relative path
  let url = params.url;
  if (credentials.base_url && !url.startsWith('http')) {
    url = `${credentials.base_url.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  }

  // Build request headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...params.headers,
  };

  if (credentials.bearer_token) {
    headers['Authorization'] = `Bearer ${credentials.bearer_token}`;
  }

  if (credentials.api_key && credentials.api_key_header) {
    headers[credentials.api_key_header] = credentials.api_key;
  }

  if (credentials.custom_headers) {
    try {
      Object.assign(headers, JSON.parse(credentials.custom_headers));
    } catch {
      // ignore malformed custom_headers
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' && method !== 'DELETE' && params.body !== undefined
        ? JSON.stringify(params.body)
        : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => { responseHeaders[key] = value; });

    const contentType = response.headers.get('content-type') ?? '';
    const body = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new APIError(408, `HTTP request timed out after ${timeout}ms`);
    }
    throw new APIError(500, `HTTP request failed: ${error.message}`);
  }
}
