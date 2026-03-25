import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/apiResponse';

export class SeoController {
  // Public - used by frontend
  static async getPageBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const page = await prisma.seoPage.findUnique({
        where: { slug, isPublished: true },
        include: { 
          exam: {
            include: { 
              lifecycleEvents: { orderBy: { stageOrder: 'asc' } } 
            }
          }
        }
      });

      if (!page) {
        throw new AppError(404, 'NOT_FOUND', `SEO Page ${slug} not found`);
      }

      sendSuccess(res, page);
    } catch (err) {
      next(err);
    }
  }

  // Public/Admin - listing
  static async getAllSlugs(req: Request, res: Response, next: NextFunction) {
    try {
      const pages = await prisma.seoPage.findMany({
        where: { isPublished: true },
        select: { slug: true }
      });
      sendSuccess(res, pages);
    } catch (err) {
      next(err);
    }
  }

  // --- Admin Methods ---

  static async getAllPages(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [pages, total] = await Promise.all([
        prisma.seoPage.findMany({
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
          include: {
            exam: {
              select: { id: true, title: true, slug: true }
            }
          }
        }),
        prisma.seoPage.count()
      ]);

      sendSuccess(res, {
        pages,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (err) {
      next(err);
    }
  }

  static async createPage(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug, title, content, metaTitle, metaDescription, keywords, ogImage, canonicalUrl, isPublished, examId, category } = req.body;
      
      const existing = await prisma.seoPage.findUnique({ where: { slug } });
      if (existing) {
        throw new AppError(400, 'CONFLICT', `A page with slug "${slug}" already exists`);
      }

      const page = await prisma.seoPage.create({
        data: {
          slug,
          title,
          content,
          metaTitle,
          metaDescription,
          keywords: keywords || [],
          ogImage,
          canonicalUrl,
          isPublished: isPublished ?? true,
          examId,
          category
        }
      });

      sendSuccess(res, page, 201);
    } catch (err) {
      next(err);
    }
  }

  static async updatePage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Check if we're updating a slug and it conflict
      if (data.slug) {
        const existing = await prisma.seoPage.findFirst({
          where: { slug: data.slug, id: { not: id } }
        });
        if (existing) {
          throw new AppError(400, 'CONFLICT', `Another page with slug "${data.slug}" already exists`);
        }
      }

      const page = await prisma.seoPage.update({
        where: { id },
        data
      });

      sendSuccess(res, page);
    } catch (err) {
      next(err);
    }
  }

  static async deletePage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.seoPage.delete({ where: { id } });
      sendSuccess(res, { deleted: true });
    } catch (err) {
      next(err);
    }
  }
}
