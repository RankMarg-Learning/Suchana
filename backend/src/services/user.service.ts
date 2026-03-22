import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { RegisterUserDto, UpdateUserDto } from '../schemas/user.schema';
import { logger } from '../utils/logger';
import * as pushTokenService from './pushToken.service';

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
export async function getUserByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } });
}


export async function getUserById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', `User ${id} not found`);
    return user;
}

export async function updateUser(id: string, dto: UpdateUserDto) {
    const user = await prisma.user.update({
        where: { id },
        data: { ...dto, updatedAt: new Date() } as Prisma.UserUpdateInput
    });

    if (dto.notificationsEnabled === false) {
        await pushTokenService.deactivateUserTokens(id);
    }

    return user;
}


function calculateExamMatch(user: any, exam: any): number {
    let score = 70;

    if (user.dateOfBirth && (exam.minAge || exam.maxAge)) {
        const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
        if ((exam.minAge && age < exam.minAge) || (exam.maxAge && age > exam.maxAge)) {
            score -= 40;
        } else {
            score += 10;
        }
    }

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

    const where: Prisma.ExamWhereInput = {
        isPublished: true,
        ...(user.preferredCategories.length > 0 && {
            category: { in: user.preferredCategories },
        }),
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
                select: { id: true, slug: true, title: true, shortTitle: true, category: true, conductingBody: true }
            }
        },
        orderBy: { notifiedAt: 'desc' },
        take: 50 // UI usually shows recent first
    });
}
