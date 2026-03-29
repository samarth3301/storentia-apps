import catchAsync from '@/handlers/async.handler';
import type { Request, Response } from 'express';
import { CredentialsService } from '@/services/credentials.service';
import { validate } from '@/middlewares/validation.middleware';
import { createCredentialSchema, updateCredentialSchema } from '@/validations/apps.validations';

const list = catchAsync(async (req: Request & { user?: any }, res: Response): Promise<void> => {
  const { appSlug } = req.query as { appSlug?: string };
  const credentials = await CredentialsService.listByUser(req.user.userId, appSlug);

  res.status(200).json({
    status: 'success',
    data: { credentials },
  });
});

const create = catchAsync(async (req: Request & { user?: any }, res: Response): Promise<void> => {
  const credential = await CredentialsService.create({
    userId: req.user.userId,
    ...req.body,
  });

  res.status(201).json({
    status: 'success',
    message: 'Credentials saved successfully',
    data: { credential },
  });
});

const update = catchAsync(async (req: Request & { user?: any }, res: Response): Promise<void> => {
  const credential = await CredentialsService.update(req.params.id, req.user.userId, req.body);

  res.status(200).json({
    status: 'success',
    message: 'Credentials updated successfully',
    data: { credential },
  });
});

const remove = catchAsync(async (req: Request & { user?: any }, res: Response): Promise<void> => {
  await CredentialsService.delete(req.params.id, req.user.userId);

  res.status(200).json({
    status: 'success',
    message: 'Credentials deleted successfully',
  });
});

export default {
  list,
  create: [validate(createCredentialSchema), create],
  update: [validate(updateCredentialSchema), update],
  remove,
};
