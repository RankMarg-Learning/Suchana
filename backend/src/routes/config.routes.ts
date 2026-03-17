import { Router } from 'express';
import * as configController from '../controllers/config.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// ────────── Home Banners ──────────────────────────────────────
// GET /api/v1/config/banners
router.get('/banners', configController.getHomeBanners);

// POST /api/v1/config/banners  (admin)
router.post('/banners', requireAdmin, configController.createHomeBanner);

// PATCH /api/v1/config/banners/:id  (admin)
router.patch('/banners/:id', requireAdmin, configController.updateHomeBanner);

// DELETE /api/v1/config/banners/:id  (admin)
router.delete('/banners/:id', requireAdmin, configController.deleteHomeBanner);

// ────────── App Config ────────────────────────────────────────
// GET /api/v1/config/settings  (admin – all keys)
router.get('/settings', requireAdmin, configController.getAllAppConfigs);

// GET /api/v1/config/:key  (any)
router.get('/:key', configController.getAppConfig);

// POST /api/v1/config  (admin – upsert)
router.post('/', requireAdmin, configController.setAppConfig);

// DELETE /api/v1/config/settings/:id  (admin)
router.delete('/settings/:id', requireAdmin, configController.deleteAppConfig);

export { router as configRouter };
