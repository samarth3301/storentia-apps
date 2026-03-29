export interface RazorpayCredentials {
  key_id: string;
  key_secret: string;
}

export interface CreateOrderParams {
  amount: number;          // in paise (smallest INR unit)
  currency?: string;       // default: 'INR'
  receipt?: string;
  notes?: Record<string, string>;
  partial_payment?: boolean;
}

export interface FetchPaymentParams {
  paymentId: string;
}

export interface CapturePaymentParams {
  paymentId: string;
  amount: number;
  currency?: string;
}

export interface RefundPaymentParams {
  paymentId: string;
  amount?: number;
  speed?: 'normal' | 'optimum';
  notes?: Record<string, string>;
}

export interface FetchOrderParams {
  orderId: string;
}
