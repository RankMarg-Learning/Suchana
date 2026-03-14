import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { RegisterUserDto, UpdateUserDto } from '../schemas/user.schema';
import { logger } from '../utils/logger';

// ─── Registration & Profile ───────────────────────────────────

export async function registerOrUpdateUser(dto: RegisterUserDto) {
    const data: Prisma.UserUpsertArgs['update'] = {
        ...dto,
        updatedAt: new Date(),
        preferredCategories: dto.preferredCategories ?? [],
        savedExamIds: dto.savedExamIds ?? [],
    };

    const user = await prisma.user.upsert({
        where: { phone: dto.phone },
        update: data,
        create: {
            ...dto,
            preferredCategories: dto.preferredCategories ?? [],
            savedExamIds: dto.savedExamIds ?? [],
        },
    });
    
    logger.info(`User ${user.id} synced via phone ${user.phone}`);
    return user;
}

export async function getUserById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', `User ${id} not found`);
    return user;
}

export async function updateUser(id: string, dto: UpdateUserDto) {
    return prisma.user.update({ 
        where: { id }, 
        data: { ...dto, updatedAt: new Date() } as Prisma.UserUpdateInput 
    });
}

// ─── Exam Personalization ─────────────────────────────────────

/**
 * Core Algorithm: Calculate how well an exam fits a user (0-100)
 */
function calculateExamMatch(user: any, exam: any): number {
    let score = 70; // High base since we filter by categories first

    // 1. Precise Age matching
    if (user.dateOfBirth && (exam.minAge || exam.maxAge)) {
        const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
        if ((exam.minAge && age < exam.minAge) || (exam.maxAge && age > exam.maxAge)) {
            score -= 40; // Heavy penalty for age mismatch
        } else {
            score += 10; // Bonus for being in range
        }
    }

    // 2. Skill & Qualification parsing
    const searchString = `${exam.title} ${exam.description || ''} ${exam.conductingBody}`.toLowerCase();
    
    if (user.qualification && searchString.includes(user.qualification.toLowerCase().split('_')[0])) {
        score += 15;
    }
    
    if (user.degree && searchString.includes(user.degree.toLowerCase())) {
        score += 10;
    }

    return Math.min(100, Math.max(0, score));
}

export async function getUserExams(id: string, page: number = 1, limit: number = 20) {
    const user = await getUserById(id);

    // Dynamic Filter Build
    const where: Prisma.ExamWhereInput = {
        isPublished: true,
        ...(user.preferredCategories.length > 0 && {
            category: { in: user.preferredCategories },
        }),
        // Localization logic: Prefer National or results matching their home state
        OR: [
            { examLevel: 'NATIONAL' },
            ...(user.state ? [{ state: { contains: user.state, mode: 'insensitive' as Prisma.QueryMode } }] : [])
        ]
    };

    const [exams, total] = await Promise.all([
        prisma.exam.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                lifecycleEvents: {
                    where: { eventType: 'REGISTRATION' },
                    take: 1
                }
            }
        }),
        prisma.exam.count({ where })
    ]);

    return {
        exams: exams.map(e => ({ ...e, matchScore: calculateExamMatch(user, e) })),
        total,
        page,
        limit
    };
}

// ─── Notification & Interaction ───────────────────────────────

export async function toggleSavedExam(id: string, examId: string) {
    const user = await getUserById(id);
    const isSaved = user.savedExamIds.includes(examId);
    
    return prisma.user.update({
        where: { id },
        data: {
            savedExamIds: isSaved 
                ? user.savedExamIds.filter(eid => eid !== examId) 
                : [...user.savedExamIds, examId]
        }
    });
}

/**
 * Fetch notifications optimized for the user's specific followed content
 */
export async function getUserNotifications(id: string) {
    const user = await getUserById(id);

    return prisma.lifecycleEvent.findMany({
        where: {
            notificationSent: true,
            exam: {
                OR: [
                    { id: { in: user.savedExamIds } },
                    ...(user.preferredCategories.length > 0 ? [{ category: { in: user.preferredCategories } }] : [])
                ]
            }
        },
        include: {
            exam: {
                select: { id: true, title: true, shortTitle: true, category: true, conductingBody: true }
            }
        },
        orderBy: { notifiedAt: 'desc' },
        take: 50 // UI usually shows recent first
    });
}
