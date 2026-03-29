import { Router } from 'express';
import { appsController, credentialsController, executeController } from '@/controllers/v1/apps';
import { authenticate } from '@/middlewares/auth.middleware';
import { serviceAuth } from '@/middlewares/service-auth.middleware';

const router = Router();

// ── Service-to-service ─────────────────────────────────────────────────────
// Called by the core Storentia service with an X-Service-Key header.
// The body must be an AES-256-GCM encrypted payload.
router.post('/execute', serviceAuth, ...executeController.execute);

// ── User credential management ─────────────────────────────────────────────
// Users store and manage their third-party API keys here.
router.get('/credentials', authenticate, credentialsController.list);
router.post('/credentials', authenticate, ...credentialsController.create);
router.put('/credentials/:id', authenticate, ...credentialsController.update);
router.delete('/credentials/:id', authenticate, credentialsController.remove);

// ── App catalog ────────────────────────────────────────────────────────────
// Public — anyone can browse available apps and their required credentials.
router.get('/', appsController.list);
router.get('/:slug', appsController.get);

export default router;
