// ============================================================
// src/routes/pushToken.routes.ts
// ============================================================
import { Router } from 'express';
import * as pushTokenController from '../controllers/pushToken.controller';
import { validate } from '../middleware/validate';
import { registerPushTokenSchema, deactivatePushTokenSchema } from '../schemas/pushToken.schema';

const router = Router();

// POST /api/v1/push-tokens/register
router.post('/register', validate(registerPushTokenSchema), pushTokenController.registerToken);

// POST /api/v1/push-tokens/deactivate
router.post('/deactivate', validate(deactivatePushTokenSchema), pushTokenController.deactivateToken);

export { router as pushTokenRouter };
