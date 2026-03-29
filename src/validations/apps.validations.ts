import { z } from 'zod';

export const createCredentialSchema = z.object({
  appSlug: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  credentials: z.record(z.string(), z.string()),
});

export const updateCredentialSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    credentials: z.record(z.string(), z.string()).optional(),
  })
  .refine(data => data.name || data.credentials, {
    message: 'At least one of name or credentials must be provided',
  });

export const executePayloadSchema = z.object({
  payload: z.string().min(1),
  iv: z.string().min(1),
  tag: z.string().min(1),
});
