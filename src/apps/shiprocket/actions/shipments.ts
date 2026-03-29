import type { ShiprocketCredentials, GenerateAWBParams, GetCouriersParams } from '../types';
import { shiprocketRequest } from './auth';

export async function generateAWB(
  params: GenerateAWBParams,
  credentials: ShiprocketCredentials
): Promise<any> {
  return shiprocketRequest('POST', '/courier/assign/awb', credentials, {
    shipment_id: params.shipment_id,
    courier_id: params.courier_id,
  });
}

export async function getAvailableCouriers(
  params: GetCouriersParams,
  credentials: ShiprocketCredentials
): Promise<any> {
  const qs = new URLSearchParams({
    pickup_postcode: params.pickup_postcode,
    delivery_postcode: params.delivery_postcode,
    weight: String(params.weight),
    cod: String(params.cod ?? false),
  });
  return shiprocketRequest('GET', `/courier/serviceability/?${qs.toString()}`, credentials);
}
