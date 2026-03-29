import catchAsync from '@/handlers/async.handler';
import type { Request, Response } from 'express';
import { getAllApps, getApp } from '@/apps/registry';
import { APIError } from '@/utils/APIError';

const list = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const apps = getAllApps().map(app => app.meta);

  res.status(200).json({
    status: 'success',
    data: { apps },
  });
});

const get = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const app = getApp(req.params.slug);

  if (!app) {
    throw new APIError(404, `App "${req.params.slug}" not found`);
  }

  res.status(200).json({
    status: 'success',
    data: { app: app.meta },
  });
});

export default { list, get };
