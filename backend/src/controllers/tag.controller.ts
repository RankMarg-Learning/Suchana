import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/apiResponse';

function toSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
}

export class TagController {

    // GET /api/v1/tags
    static async getAllTags(req: Request, res: Response, next: NextFunction) {
        try {
            const search = req.query.search as string | undefined;
            const tags = await prisma.tag.findMany({
                where: search
                    ? { name: { contains: search, mode: 'insensitive' } }
                    : undefined,
                orderBy: { name: 'asc' },

            });
            sendSuccess(res, tags);
        } catch (err) {
            next(err);
        }
    }

    // POST /api/v1/tags
    static async createTag(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, color, description } = req.body;
            if (!name) throw new AppError(400, 'BAD_REQUEST', 'Tag name is required');

            const slug = toSlug(name);

            const existing = await prisma.tag.findUnique({ where: { slug } });
            if (existing) throw new AppError(400, 'CONFLICT', `Tag with slug "${slug}" already exists`);

            const tag = await prisma.tag.create({
                data: { name: name.trim(), slug, color: color || '#6366f1', description }
            });
            sendSuccess(res, tag, 201);
        } catch (err) {
            next(err);
        }
    }

    // PATCH /api/v1/tags/:id
    static async updateTag(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, color, description } = req.body;

            const dataToUpdate: any = { color, description };
            if (name) {
                dataToUpdate.name = name.trim();
                dataToUpdate.slug = toSlug(name);
                // Check for slug conflict
                const conflict = await prisma.tag.findFirst({
                    where: { slug: dataToUpdate.slug, id: { not: id } }
                });
                if (conflict) throw new AppError(400, 'CONFLICT', `Another tag with slug "${dataToUpdate.slug}" already exists`);
            }

            const tag = await prisma.tag.update({
                where: { id },
                data: dataToUpdate,
                include: { _count: { select: { pages: true } } }
            });
            sendSuccess(res, tag);
        } catch (err) {
            next(err);
        }
    }

    // DELETE /api/v1/tags/:id
    static async deleteTag(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await prisma.tag.delete({ where: { id } });
            sendSuccess(res, { deleted: true });
        } catch (err) {
            next(err);
        }
    }

    // GET /api/v1/tags/seo-page/:pageId  — get tags for a specific article
    static async getTagsByPage(req: Request, res: Response, next: NextFunction) {
        try {
            const { pageId } = req.params;
            const relations = await prisma.seoPageTag.findMany({
                where: { seoPageId: pageId },
                include: { tag: true },
                orderBy: { tag: { name: 'asc' } }
            });
            sendSuccess(res, relations.map(r => r.tag));
        } catch (err) {
            next(err);
        }
    }

    // PUT /api/v1/tags/seo-page/:pageId  — replace all tags for an article (body: { tagIds: string[] })
    static async setPageTags(req: Request, res: Response, next: NextFunction) {
        try {
            const { pageId } = req.params;
            const { tagIds } = req.body as { tagIds: string[] };

            if (!Array.isArray(tagIds)) throw new AppError(400, 'BAD_REQUEST', 'tagIds must be an array');

            // Ensure page exists
            const page = await prisma.seoPage.findUnique({ where: { id: pageId } });
            if (!page) throw new AppError(404, 'NOT_FOUND', 'SEO page not found');

            // Replace in a transaction
            await prisma.$transaction([
                prisma.seoPageTag.deleteMany({ where: { seoPageId: pageId } }),
                prisma.seoPageTag.createMany({
                    data: tagIds.map(tagId => ({ seoPageId: pageId, tagId })),
                    skipDuplicates: true
                })
            ]);

            const updatedTags = await prisma.seoPageTag.findMany({
                where: { seoPageId: pageId },
                include: { tag: true }
            });
            sendSuccess(res, updatedTags.map(r => r.tag));
        } catch (err) {
            next(err);
        }
    }

    // GET /api/v1/tags/:tagId/related-pages?excludePageId=&limit=5
    static async getRelatedPagesByTag(req: Request, res: Response, next: NextFunction) {
        try {
            const { tagId } = req.params;
            const excludePageId = req.query.excludePageId as string | undefined;
            const limit = Math.min(parseInt(req.query.limit as string) || 5, 10);

            const relations = await prisma.seoPageTag.findMany({
                where: {
                    tagId,
                    ...(excludePageId ? { seoPageId: { not: excludePageId } } : {}),
                },
                include: {
                    seoPage: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            category: true,
                            isPublished: true,
                            metaDescription: true,
                            updatedAt: true,
                        },
                    },
                },
                take: limit,
                orderBy: { seoPage: { updatedAt: 'desc' } },
            });

            sendSuccess(res, relations.map(r => r.seoPage));
        } catch (err) {
            next(err);
        }
    }
}
