import type { RazorpayCredentials, CreateOrderParams, FetchOrderParams } from '../types';
import { APIError } from '@/utils/APIError';

const RAZORPAY_BASE = 'https://api.razorpay.com/v1';

function basicAuth(credentials: RazorpayCredentials): string {
  return `Basic ${Buffer.from(`${credentials.key_id}:${credentials.key_secret}`).toString('base64')}`;
}

export async function createOrder(
  params: CreateOrderParams,
  credentials: RazorpayCredentials
): Promise<any> {
  const response = await fetch(`${RAZORPAY_BASE}/orders`, {
    method: 'POST',
    headers: {
      Authorization: basicAuth(credentials),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency ?? 'INR',
      receipt: params.receipt,
      notes: params.notes,
      partial_payment: params.partial_payment ?? false,
    }),
  });

  const data = await response.json() as any;

  if (!response.ok) {
    throw new APIError(response.status, `Razorpay API error: ${data?.error?.description ?? response.statusText}`);
  }

  return data;
}

export async function fetchOrder(
  params: FetchOrderParams,
  credentials: RazorpayCredentials
): Promise<any> {
  const response = await fetch(`${RAZORPAY_BASE}/orders/${params.orderId}`, {
    headers: { Authorization: basicAuth(credentials) },
  });

  const data = await response.json() as any;

  if (!response.ok) {
    throw new APIError(response.status, `Razorpay API error: ${data?.error?.description ?? response.statusText}`);
  }

  return data;
}
