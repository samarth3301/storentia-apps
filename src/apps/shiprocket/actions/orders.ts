import type { ShiprocketCredentials, CreateOrderParams, TrackOrderParams, CancelOrderParams } from '../types';
import { shiprocketRequest } from './auth';

export async function createOrder(
  params: CreateOrderParams,
  credentials: ShiprocketCredentials
): Promise<any> {
  return shiprocketRequest('POST', '/orders/create/adhoc', credentials, params as any);
}

export async function trackOrder(
  params: TrackOrderParams,
  credentials: ShiprocketCredentials
): Promise<any> {
  if (params.awbCode) {
    return shiprocketRequest('GET', `/courier/track/awb/${params.awbCode}`, credentials);
  }
  if (params.shipmentId) {
    return shiprocketRequest('GET', `/orders/show/${params.shipmentId}`, credentials);
  }
  if (params.orderId) {
    return shiprocketRequest('GET', `/orders/show/${params.orderId}`, credentials);
  }
  throw new Error('Provide at least one of: awbCode, shipmentId, or orderId');
}

export async function cancelOrder(
  params: CancelOrderParams,
  credentials: ShiprocketCredentials
): Promise<any> {
  return shiprocketRequest('POST', '/orders/cancel', credentials, { ids: params.ids });
}
