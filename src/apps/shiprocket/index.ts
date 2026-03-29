import { BaseApp } from '@/apps/base.app';
import type { AppMeta } from '@/types/apps.types';
import { APIError } from '@/utils/APIError';
import { createOrder, trackOrder, cancelOrder } from './actions/orders';
import { generateAWB, getAvailableCouriers } from './actions/shipments';
import type { ShiprocketCredentials } from './types';

class ShiprocketApp extends BaseApp {
  readonly meta: AppMeta = {
    slug: 'shiprocket',
    name: 'Shiprocket',
    description: 'Create shipments, track orders, and manage logistics via the Shiprocket API',
    category: 'productivity',
    requiredCredentials: [
      {
        key: 'email',
        label: 'Account Email',
        type: 'text',
        required: true,
        description: 'Shiprocket account email address',
      },
      {
        key: 'password',
        label: 'Account Password',
        type: 'password',
        required: true,
        description: 'Shiprocket account password',
      },
    ],
    actions: {
      createOrder: {
        name: 'Create Order',
        description: 'Create a new shipment order on Shiprocket',
        params: [
          { key: 'order_id', label: 'Your Order ID', type: 'string', required: true },
          { key: 'order_date', label: 'Order Date (YYYY-MM-DD HH:mm)', type: 'string', required: true },
          { key: 'pickup_location', label: 'Pickup Location Name', type: 'string', required: true },
          { key: 'billing_customer_name', label: 'Customer Name', type: 'string', required: true },
          { key: 'billing_address', label: 'Billing Address', type: 'string', required: true },
          { key: 'billing_city', label: 'City', type: 'string', required: true },
          { key: 'billing_pincode', label: 'Pincode', type: 'string', required: true },
          { key: 'billing_state', label: 'State', type: 'string', required: true },
          { key: 'billing_country', label: 'Country', type: 'string', required: true },
          { key: 'billing_email', label: 'Customer Email', type: 'string', required: true },
          { key: 'billing_phone', label: 'Customer Phone', type: 'string', required: true },
          { key: 'order_items', label: 'Order Items', type: 'array', required: true },
          { key: 'payment_method', label: 'Payment Method (Prepaid/COD)', type: 'string', required: true },
          { key: 'sub_total', label: 'Sub Total', type: 'number', required: true },
          { key: 'weight', label: 'Weight (kg)', type: 'number', required: true },
          { key: 'length', label: 'Length (cm)', type: 'number', required: true },
          { key: 'breadth', label: 'Breadth (cm)', type: 'number', required: true },
          { key: 'height', label: 'Height (cm)', type: 'number', required: true },
        ],
      },
      trackOrder: {
        name: 'Track Order',
        description: 'Track a shipment by AWB code, shipment ID, or order ID',
        params: [
          { key: 'awbCode', label: 'AWB Code', type: 'string', required: false },
          { key: 'shipmentId', label: 'Shipment ID', type: 'string', required: false },
          { key: 'orderId', label: 'Order ID', type: 'string', required: false },
        ],
      },
      cancelOrder: {
        name: 'Cancel Order',
        description: 'Cancel one or more orders by their Shiprocket order IDs',
        params: [
          { key: 'ids', label: 'Order IDs (array)', type: 'array', required: true },
        ],
      },
      generateAWB: {
        name: 'Generate AWB',
        description: 'Assign a courier and generate an AWB number for a shipment',
        params: [
          { key: 'shipment_id', label: 'Shipment ID', type: 'number', required: true },
          { key: 'courier_id', label: 'Courier ID', type: 'number', required: true },
        ],
      },
      getAvailableCouriers: {
        name: 'Get Available Couriers',
        description: 'Check courier serviceability and rates for a route',
        params: [
          { key: 'pickup_postcode', label: 'Pickup Pincode', type: 'string', required: true },
          { key: 'delivery_postcode', label: 'Delivery Pincode', type: 'string', required: true },
          { key: 'weight', label: 'Weight (kg)', type: 'number', required: true },
          { key: 'cod', label: 'COD', type: 'boolean', required: false },
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

    const creds = credentials as unknown as ShiprocketCredentials;

    switch (action) {
      case 'createOrder': return createOrder(params as any, creds);
      case 'trackOrder': return trackOrder(params as any, creds);
      case 'cancelOrder': return cancelOrder(params as any, creds);
      case 'generateAWB': return generateAWB(params as any, creds);
      case 'getAvailableCouriers': return getAvailableCouriers(params as any, creds);
      default: throw new APIError(400, `Unknown action: ${action}`);
    }
  }
}

export default new ShiprocketApp();
