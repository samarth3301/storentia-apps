import catchAsync from '@/handlers/async.handler';
import type { Request, Response } from 'express';
import { ProcessorService } from '@/services/processor.service';
import { validate } from '@/middlewares/validation.middleware';
import { executePayloadSchema } from '@/validations/apps.validations';

const execute = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const result = await ProcessorService.execute(req.body);

  res.status(result.success ? 200 : 422).json({
    status: result.success ? 'success' : 'error',
    ...(result.success ? { data: result.data } : { error: result.error }),
    meta: { executionTimeMs: result.executionTimeMs },
  });
});

export default {
  execute: [validate(executePayloadSchema), execute],
};
