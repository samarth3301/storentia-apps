import type { StripeCredentials, CreatePaymentIntentParams, ConfirmPaymentIntentParams, GetPaymentIntentParams, RefundParams, ListPaymentsParams } from '../types';
import { APIError } from '@/utils/APIError';

const STRIPE_BASE = 'https://api.stripe.com/v1';

async function stripeRequest(
  method: string,
  path: string,
  credentials: StripeCredentials,
  body?: Record<string, any>
): Promise<any> {
  const response = await fetch(`${STRIPE_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${credentials.secret_key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body ? new URLSearchParams(flattenStripeParams(body)).toString() : undefined,
  });

  const data = await response.json() as any;

  if (!response.ok) {
    throw new APIError(response.status, `Stripe API error: ${data?.error?.message ?? response.statusText}`);
  }

  return data;
}

/** Stripe API uses dot-notation for nested params in URL-encoded form */
function flattenStripeParams(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;

    const fullKey = prefix ? `${prefix}[${key}]` : key;

    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenStripeParams(value, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        result[`${fullKey}[${i}]`] = String(v);
      });
    } else {
      result[fullKey] = String(value);
    }
  }

  return result;
}

export async function createPaymentIntent(
  params: CreatePaymentIntentParams,
  credentials: StripeCredentials
): Promise<any> {
  const body: Record<string, any> = {
    amount: params.amount,
    currency: params.currency,
  };

  if (params.customer) body['customer'] = params.customer;
  if (params.description) body['description'] = params.description;
  if (params.receipt_email) body['receipt_email'] = params.receipt_email;
  if (params.metadata) body['metadata'] = params.metadata;
  if (params.automatic_payment_methods) {
    body['automatic_payment_methods[enabled]'] = 'true';
  }

  return stripeRequest('POST', '/payment_intents', credentials, body);
}

export async function confirmPaymentIntent(
  params: ConfirmPaymentIntentParams,
  credentials: StripeCredentials
): Promise<any> {
  return stripeRequest('POST', `/payment_intents/${params.paymentIntentId}/confirm`, credentials, {
    payment_method: params.payment_method,
  });
}

export async function getPaymentIntent(
  params: GetPaymentIntentParams,
  credentials: StripeCredentials
): Promise<any> {
  return stripeRequest('GET', `/payment_intents/${params.paymentIntentId}`, credentials);
}

export async function createRefund(
  params: RefundParams,
  credentials: StripeCredentials
): Promise<any> {
  const body: Record<string, any> = {};
  if (params.paymentIntentId) body['payment_intent'] = params.paymentIntentId;
  if (params.chargeId) body['charge'] = params.chargeId;
  if (params.amount) body['amount'] = params.amount;
  if (params.reason) body['reason'] = params.reason;
  return stripeRequest('POST', '/refunds', credentials, body);
}

export async function listPayments(
  params: ListPaymentsParams,
  credentials: StripeCredentials
): Promise<any> {
  const qs = new URLSearchParams();
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.starting_after) qs.set('starting_after', params.starting_after);
  if (params.customer) qs.set('customer', params.customer);
  return stripeRequest('GET', `/payment_intents?${qs.toString()}`, credentials);
}
