import type { ShiprocketCredentials } from '../types';
import { APIError } from '@/utils/APIError';

const SHIPROCKET_BASE = 'https://apiv2.shiprocket.in/v1/external';

/**
 * Authenticates with the Shiprocket API and returns a JWT token.
 * This token is valid for 24 hours.
 */
export async function getToken(credentials: ShiprocketCredentials): Promise<string> {
  // Return cached token if available
  if (credentials.token) return credentials.token;

  const response = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: credentials.email, password: credentials.password }),
  });

  const data = await response.json() as any;

  if (!response.ok || !data.token) {
    throw new APIError(response.status, `Shiprocket auth failed: ${data?.message ?? response.statusText}`);
  }

  return data.token as string;
}

export async function shiprocketRequest(
  method: string,
  path: string,
  credentials: ShiprocketCredentials,
  body?: Record<string, any>
): Promise<any> {
  const token = await getToken(credentials);

  const response = await fetch(`${SHIPROCKET_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json() as any;

  if (!response.ok) {
    throw new APIError(response.status, `Shiprocket API error: ${data?.message ?? response.statusText}`);
  }

  return data;
}
