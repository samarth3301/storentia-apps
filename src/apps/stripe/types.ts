export interface StripeCredentials {
  secret_key: string;
}

export interface CreatePaymentIntentParams {
  amount: number;          // in smallest currency unit (e.g. cents)
  currency: string;        // ISO 4217 (e.g. 'usd', 'inr')
  customer?: string;       // Stripe customer ID
  metadata?: Record<string, string>;
  description?: string;
  receipt_email?: string;
  automatic_payment_methods?: boolean;
}

export interface ConfirmPaymentIntentParams {
  paymentIntentId: string;
  payment_method: string;
}

export interface RefundParams {
  paymentIntentId?: string;
  chargeId?: string;
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export interface GetPaymentIntentParams {
  paymentIntentId: string;
}

export interface CreateCustomerParams {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface ListPaymentsParams {
  limit?: number;
  starting_after?: string;
  customer?: string;
}
