import type { StripeCredentials, CreateCustomerParams } from '../types';
import { APIError } from '@/utils/APIError';

const STRIPE_BASE = 'https://api.stripe.com/v1';

async function stripePost(
  path: string,
  credentials: StripeCredentials,
  body: Record<string, string>
): Promise<any> {
  const response = await fetch(`${STRIPE_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${credentials.secret_key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body).toString(),
  });

  const data = await response.json() as any;

  if (!response.ok) {
    throw new APIError(response.status, `Stripe API error: ${data?.error?.message ?? response.statusText}`);
  }

  return data;
}

export async function createCustomer(
  params: CreateCustomerParams,
  credentials: StripeCredentials
): Promise<any> {
  const body: Record<string, string> = { email: params.email };
  if (params.name) body['name'] = params.name;
  if (params.phone) body['phone'] = params.phone;
  if (params.metadata) {
    for (const [k, v] of Object.entries(params.metadata)) {
      body[`metadata[${k}]`] = v;
    }
  }
  return stripePost('/customers', credentials, body);
}
