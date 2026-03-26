import { Router } from 'express';
import { SeoController } from '../controllers/seo.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * PUBLIC ROUTES (Used by Website Frontend)
 */
// fetchAllSeoPageSlugs uses /api/v1/seo-pages
router.get('/', SeoController.getAllSlugs);
// fetchSeoPageBySlug uses /api/v1/seo-pages/:slug
router.get('/:slug', SeoController.getPageBySlug);


/**
 * ADMIN ROUTES (Used by Admin Dashboard)
 */
// Admin list (full details)
router.get('/admin/list', requireAdmin, SeoController.getAllPages);
// CRUD
router.post('/', requireAdmin, SeoController.createPage);
router.post('/admin/generate-exam-pages', requireAdmin, SeoController.generateExamPages);
router.patch('/:id', requireAdmin, SeoController.updatePage);
router.delete('/:id', requireAdmin, SeoController.deletePage);

export { router as seoRouter };
