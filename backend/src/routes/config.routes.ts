import { Router } from 'express';
import * as configController from '../controllers/config.controller';

const router = Router();

router.get('/banners', configController.getHomeBanners);
router.get('/:key', configController.getAppConfig);

export { router as configRouter };
