import { Router } from 'express';
import { SeoController } from '../controllers/seo.controller';

const router = Router();

router.get('/:slug', SeoController.getPageBySlug);
router.get('/', SeoController.getAllSlugs);

export { router as seoRouter };
