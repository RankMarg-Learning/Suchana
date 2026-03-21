import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/apiResponse';

export class SeoController {
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
}
