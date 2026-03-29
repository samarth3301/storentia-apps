import { BaseApp } from '@/apps/base.app';
import type { AppMeta } from '@/types/apps.types';
import { APIError } from '@/utils/APIError';
import { createOrder, fetchOrder } from './actions/orders';
import { fetchPayment, capturePayment, refundPayment } from './actions/payments';
import type { RazorpayCredentials } from './types';

class RazorpayApp extends BaseApp {
  readonly meta: AppMeta = {
    slug: 'razorpay',
    name: 'Razorpay',
    description: 'Create orders, capture payments, and issue refunds via the Razorpay API',
    category: 'payment',
    requiredCredentials: [
      {
        key: 'key_id',
        label: 'Key ID',
        type: 'text',
        required: true,
        description: 'Razorpay Key ID (rzp_live_... or rzp_test_...)',
      },
      {
        key: 'key_secret',
        label: 'Key Secret',
        type: 'password',
        required: true,
        description: 'Razorpay Key Secret',
      },
    ],
    actions: {
      createOrder: {
        name: 'Create Order',
        description: 'Create a new Razorpay order before initiating payment',
        params: [
          { key: 'amount', label: 'Amount (paise)', type: 'number', required: true, description: 'Amount in paise (e.g. 50000 = ₹500)' },
          { key: 'currency', label: 'Currency', type: 'string', required: false, description: 'Default: INR' },
          { key: 'receipt', label: 'Receipt ID', type: 'string', required: false },
          { key: 'notes', label: 'Notes', type: 'object', required: false },
          { key: 'partial_payment', label: 'Allow Partial Payment', type: 'boolean', required: false },
        ],
      },
      fetchOrder: {
        name: 'Fetch Order',
        description: 'Retrieve an existing order by ID',
        params: [
          { key: 'orderId', label: 'Order ID', type: 'string', required: true },
        ],
      },
      fetchPayment: {
        name: 'Fetch Payment',
        description: 'Retrieve a payment by ID',
        params: [
          { key: 'paymentId', label: 'Payment ID', type: 'string', required: true },
        ],
      },
      capturePayment: {
        name: 'Capture Payment',
        description: 'Capture an authorized payment',
        params: [
          { key: 'paymentId', label: 'Payment ID', type: 'string', required: true },
          { key: 'amount', label: 'Amount (paise)', type: 'number', required: true },
          { key: 'currency', label: 'Currency', type: 'string', required: false },
        ],
      },
      refundPayment: {
        name: 'Refund Payment',
        description: 'Issue a full or partial refund for a payment',
        params: [
          { key: 'paymentId', label: 'Payment ID', type: 'string', required: true },
          { key: 'amount', label: 'Refund Amount (paise, partial)', type: 'number', required: false },
          { key: 'speed', label: 'Refund Speed', type: 'string', required: false, description: 'normal | optimum' },
          { key: 'notes', label: 'Notes', type: 'object', required: false },
        ],
      },
    },
  };

  async execute(
    action: string,
    params: Record<string, any>,
    credentials: Record<string, string>
  ): Promise<any> {
    this.validateAction(action);
    this.validateCredentials(credentials);

    const creds = credentials as unknown as RazorpayCredentials;

    switch (action) {
      case 'createOrder': return createOrder(params as any, creds);
      case 'fetchOrder': return fetchOrder(params as any, creds);
      case 'fetchPayment': return fetchPayment(params as any, creds);
      case 'capturePayment': return capturePayment(params as any, creds);
      case 'refundPayment': return refundPayment(params as any, creds);
      default: throw new APIError(400, `Unknown action: ${action}`);
    }
  }
}

export default new RazorpayApp();
