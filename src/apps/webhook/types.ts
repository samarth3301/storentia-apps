export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface WebhookCredentials {
  base_url?: string;
  bearer_token?: string;
  api_key?: string;
  api_key_header?: string;
  /** JSON string of additional key-value header pairs */
  custom_headers?: string;
}

export interface HttpRequestParams {
  url: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}
