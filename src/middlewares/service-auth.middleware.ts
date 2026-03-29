import type { Request, Response, NextFunction } from 'express';
import { APIError } from '@/utils/APIError';
import config from '@/config';

/**
 * Validates the X-Service-Key header for service-to-service requests.
 * The core Storentia service must include this header on all /execute calls.
 */
export const serviceAuth = (req: Request, res: Response, next: NextFunction) => {
  const serviceKey = req.headers['x-service-key'];

  if (!serviceKey || serviceKey !== config.service.apiKey) {
    return next(new APIError(401, 'Invalid or missing service API key'));
  }

  next();
};
