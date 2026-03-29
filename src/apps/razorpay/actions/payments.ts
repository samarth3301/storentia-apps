import type { RazorpayCredentials, FetchPaymentParams, CapturePaymentParams, RefundPaymentParams } from '../types';
import { APIError } from '@/utils/APIError';

const RAZORPAY_BASE = 'https://api.razorpay.com/v1';

function basicAuth(credentials: RazorpayCredentials): string {
  return `Basic ${Buffer.from(`${credentials.key_id}:${credentials.key_secret}`).toString('base64')}`;
}

export async function fetchPayment(
  params: FetchPaymentParams,
  credentials: RazorpayCredentials
): Promise<any> {
  const response = await fetch(`${RAZORPAY_BASE}/payments/${params.paymentId}`, {
    headers: { Authorization: basicAuth(credentials) },
  });

  const data = await response.json() as any;

  if (!response.ok) {
    throw new APIError(response.status, `Razorpay API error: ${data?.error?.description ?? response.statusText}`);
  }

  return data;
}

export async function capturePayment(
  params: CapturePaymentParams,
  credentials: RazorpayCredentials
): Promise<any> {
  const response = await fetch(`${RAZORPAY_BASE}/payments/${params.paymentId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: basicAuth(credentials),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency ?? 'INR',
    }),
  });

  const data = await response.json() as any;

  if (!response.ok) {
    throw new APIError(response.status, `Razorpay API error: ${data?.error?.description ?? response.statusText}`);
  }

  return data;
}

export async function refundPayment(
  params: RefundPaymentParams,
  credentials: RazorpayCredentials
): Promise<any> {
  const body: Record<string, any> = {};
  if (params.amount) body['amount'] = params.amount;
  if (params.speed) body['speed'] = params.speed;
  if (params.notes) body['notes'] = params.notes;

  const response = await fetch(`${RAZORPAY_BASE}/payments/${params.paymentId}/refund`, {
    method: 'POST',
    headers: {
      Authorization: basicAuth(credentials),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json() as any;

  if (!response.ok) {
    throw new APIError(response.status, `Razorpay API error: ${data?.error?.description ?? response.statusText}`);
  }

  return data;
}
