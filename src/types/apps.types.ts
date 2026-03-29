export type AppCategory = 'communication' | 'email' | 'productivity' | 'developer' | 'ai' | 'storage' | 'payment';

export interface CredentialField {
  key: string;
  label: string;
  description?: string;
  type: 'text' | 'password' | 'url';
  required: boolean;
}

export interface ActionParamDef {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
}

export interface ActionDefinition {
  name: string;
  description: string;
  params: ActionParamDef[];
}

export interface AppMeta {
  slug: string;
  name: string;
  description: string;
  category: AppCategory;
  iconUrl?: string;
  requiredCredentials: CredentialField[];
  actions: Record<string, ActionDefinition>;
}

/**
 * Encrypted payload sent by the core service to execute an app action.
 * Encrypted with AES-256-GCM using the shared PAYLOAD_ENCRYPTION_KEY.
 */
export interface ExecutePayload {
  userId: string;
  credentialId: string;
  appSlug: string;
  action: string;
  params: Record<string, any>;
  requestId: string;
  /** Unix timestamp in seconds — used for replay attack protection */
  timestamp: number;
}

export interface EncryptedExecuteRequest {
  payload: string;
  iv: string;
  tag: string;
}

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTimeMs: number;
}
