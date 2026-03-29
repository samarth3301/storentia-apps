export interface ShiprocketCredentials {
  email: string;
  password: string;
  /** Cached JWT token — set by the auth step, reused until expiry */
  token?: string;
}

export interface CreateOrderParams {
  order_id: string;
  order_date: string;          // 'YYYY-MM-DD HH:mm'
  pickup_location: string;
  billing_customer_name: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing?: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: 'Prepaid' | 'COD';
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: number;
}

export interface TrackOrderParams {
  orderId?: string;
  shipmentId?: string;
  awbCode?: string;
}

export interface CancelOrderParams {
  ids: number[];
}

export interface GenerateAWBParams {
  shipment_id: number;
  courier_id: number;
}

export interface GetCouriersParams {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  cod?: boolean;
}
