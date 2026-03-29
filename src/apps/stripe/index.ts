import { BaseApp } from '@/apps/base.app';
import type { AppMeta } from '@/types/apps.types';
import { APIError } from '@/utils/APIError';
import {
  createPaymentIntent,
  confirmPaymentIntent,
  getPaymentIntent,
  createRefund,
  listPayments,
} from './actions/payment-intents';
import { createCustomer } from './actions/customers';
import type { StripeCredentials } from './types';

class StripeApp extends BaseApp {
  readonly meta: AppMeta = {
    slug: 'stripe',
    name: 'Stripe',
    description: 'Accept payments, manage customers, and handle refunds via the Stripe API',
    category: 'payment',
    requiredCredentials: [
      {
        key: 'secret_key',
        label: 'Secret Key',
        type: 'password',
        required: true,
        description: 'Stripe secret API key (sk_live_... or sk_test_...)',
      },
    ],
    actions: {
      createPaymentIntent: {
        name: 'Create Payment Intent',
        description: 'Create a new payment intent to start collecting payment',
        params: [
          { key: 'amount', label: 'Amount (smallest unit)', type: 'number', required: true, description: 'e.g. 1000 = $10.00 USD or ₹1000 INR' },
          { key: 'currency', label: 'Currency', type: 'string', required: true, description: 'ISO 4217 code (usd, inr, eur…)' },
          { key: 'customer', label: 'Customer ID', type: 'string', required: false },
          { key: 'description', label: 'Description', type: 'string', required: false },
          { key: 'receipt_email', label: 'Receipt Email', type: 'string', required: false },
          { key: 'metadata', label: 'Metadata', type: 'object', required: false },
          { key: 'automatic_payment_methods', label: 'Enable Automatic Payment Methods', type: 'boolean', required: false },
        ],
      },
      confirmPaymentIntent: {
        name: 'Confirm Payment Intent',
        description: 'Confirm a payment intent with a payment method',
        params: [
          { key: 'paymentIntentId', label: 'Payment Intent ID', type: 'string', required: true },
          { key: 'payment_method', label: 'Payment Method ID', type: 'string', required: true },
        ],
      },
      getPaymentIntent: {
        name: 'Get Payment Intent',
        description: 'Retrieve a payment intent by ID',
        params: [
          { key: 'paymentIntentId', label: 'Payment Intent ID', type: 'string', required: true },
        ],
      },
      refund: {
        name: 'Refund Payment',
        description: 'Issue a full or partial refund for a payment',
        params: [
          { key: 'paymentIntentId', label: 'Payment Intent ID', type: 'string', required: false },
          { key: 'chargeId', label: 'Charge ID', type: 'string', required: false },
          { key: 'amount', label: 'Refund Amount (partial)', type: 'number', required: false },
          { key: 'reason', label: 'Reason', type: 'string', required: false, description: 'duplicate | fraudulent | requested_by_customer' },
        ],
      },
      listPayments: {
        name: 'List Payments',
        description: 'List payment intents with optional filters',
        params: [
          { key: 'limit', label: 'Limit', type: 'number', required: false },
          { key: 'starting_after', label: 'Starting After (cursor)', type: 'string', required: false },
          { key: 'customer', label: 'Customer ID', type: 'string', required: false },
        ],
      },
      createCustomer: {
        name: 'Create Customer',
        description: 'Create a new Stripe customer',
        params: [
          { key: 'email', label: 'Email', type: 'string', required: true },
          { key: 'name', label: 'Name', type: 'string', required: false },
          { key: 'phone', label: 'Phone', type: 'string', required: false },
          { key: 'metadata', label: 'Metadata', type: 'object', required: false },
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

    const creds = credentials as unknown as StripeCredentials;

    switch (action) {
      case 'createPaymentIntent': return createPaymentIntent(params as any, creds);
      case 'confirmPaymentIntent': return confirmPaymentIntent(params as any, creds);
      case 'getPaymentIntent': return getPaymentIntent(params as any, creds);
      case 'refund': return createRefund(params as any, creds);
      case 'listPayments': return listPayments(params as any, creds);
      case 'createCustomer': return createCustomer(params as any, creds);
      default: throw new APIError(400, `Unknown action: ${action}`);
    }
  }
}

export default new StripeApp();
