import { Router } from 'express';
import { TagController } from '../controllers/tag.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Public — list all tags (for dropdowns in frontend)
router.get('/', TagController.getAllTags);

// Public — get tags for a specific SEO page
router.get('/seo-page/:pageId', TagController.getTagsByPage);

// Public — get related pages for a tag
router.get('/:tagId/related-pages', TagController.getRelatedPagesByTag);


// Admin — CRUD for tags
router.post('/', requireAdmin, TagController.createTag);
router.patch('/:id', requireAdmin, TagController.updateTag);
router.delete('/:id', requireAdmin, TagController.deleteTag);

// Admin — assign tags to a SEO page (replaces existing)
router.put('/seo-page/:pageId', requireAdmin, TagController.setPageTags);

export { router as tagRouter };
