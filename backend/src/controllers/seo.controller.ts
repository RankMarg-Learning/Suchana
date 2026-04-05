import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/apiResponse';
import { SeoService } from '../services/seo.service';

export class SeoController {

  static async getPageBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const isAdmin = !!req.headers.authorization;
      
      const page = await prisma.seoPage.findUnique({
        where: { slug, ...(isAdmin ? {} : { isPublished: true }) },
        select: {
          id: true,
          slug: true,
          title: true,
          metaTitle: true,
          metaDescription: true,
          content: true,
          keywords: true,
          ogImage: true,
          canonicalUrl: true,
          category: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
          exam: {
            select: {
              title: true,
              shortTitle: true,
              slug: true,
              status: true,
              category: true,
              examLevel: true,
              state: true,
              conductingBody: true,
              officialWebsite: true,
              lifecycleEvents: {
                orderBy: { stageOrder: 'asc' },
                select: {
                  stage: true,
                  startsAt: true,
                  endsAt: true,
                  actionUrl: true,
                  actionLabel: true,
                }
              },
              seoPages: {
                where: {
                  isPublished: true,
                  category: { in: ['SYLLABUS', 'ELIGIBILITY', 'SALARY', 'NOTIFICATION'] }
                },
                select: { slug: true, category: true }
              }
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
      const search = req.query.search as string;
      const category = req.query.category as string;
      const isAdmin = !!req.headers.authorization; // Simple check for now based on context

      // Build where clause
      const where: any = {
        ...(isAdmin ? {} : { isPublished: true }),
        ...(category ? { category } : {}),
        ...(search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };

      const [pages, total] = await Promise.all([
        prisma.seoPage.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            isPublished: true,
            updatedAt: true,
            examId: true,
            exam: {
              select: { id: true, title: true, slug: true }
            }
          }
        }),
        prisma.seoPage.count({ where })
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

  static async generateExamPages(req: Request, res: Response, next: NextFunction) {
    try {
      const { examId, categories } = req.body;
      if (!examId) {
        throw new AppError(400, 'BAD_REQUEST', 'Exam ID is required');
      }

      const generatedCount = await SeoService.generateExamSeoPages(examId, categories);
      sendSuccess(res, { message: 'Generation complete', generatedCount });
    } catch (err) {
      next(err);
    }
  }
}

