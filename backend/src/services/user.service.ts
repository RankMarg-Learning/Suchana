// ============================================================
// src/services/user.service.ts — User business logic
// ============================================================
import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import type { RegisterUserDto, UpdateUserDto } from '../schemas/user.schema';
import { logger } from '../utils/logger';

// ─── Register / Upsert ───────────────────────────────────────
export async function registerOrUpdateUser(dto: RegisterUserDto) {
    const user = await prisma.user.upsert({
        where: { phone: dto.phone },
        update: {
            name: dto.name,
            state: dto.state,
            city: dto.city,
            dateOfBirth: dto.dateOfBirth,
            gender: dto.gender,
            qualification: dto.qualification,
            preferredCategories: dto.preferredCategories ?? [],
            preferredExamLevel: dto.preferredExamLevel,
            savedExamIds: dto.savedExamIds ?? [],
            employmentStatus: dto.employmentStatus,
            languagePreference: dto.languagePreference ?? 'HINDI',
            notificationsEnabled: dto.notificationsEnabled ?? true,
            fcmToken: dto.fcmToken,
            platform: dto.platform,
            appVersion: dto.appVersion,
            updatedAt: new Date(),
        },
        create: {
            ...dto,
            preferredCategories: dto.preferredCategories ?? [],
            savedExamIds: dto.savedExamIds ?? [],
            languagePreference: dto.languagePreference ?? 'HINDI',
            notificationsEnabled: dto.notificationsEnabled ?? true,
        },
    });
    logger.info(`User upserted: ${user.id} (${user.phone})`);
    return user;
}

// ─── Get By ID ───────────────────────────────────────────────
export async function getUserById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', `User "${id}" not found`);
    return user;
}

// ─── Update ──────────────────────────────────────────────────
export async function updateUser(id: string, dto: UpdateUserDto) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, 'USER_NOT_FOUND', `User "${id}" not found`);
    return prisma.user.update({ where: { id }, data: dto as Prisma.UserUpdateInput });
}

// ─── Personalized Exam List ───────────────────────────────────
/**
 * Calculates a match score (0-100) based on user profile and exam requirements
 */
function calculateMatchScore(user: any, exam: any): number {
    let score = 70; // Base score for being in a preferred category

    // 1. Age check
    if (user.dateOfBirth && (exam.minAge || exam.maxAge)) {
        const birthDate = new Date(user.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

        if (exam.minAge && age < exam.minAge) score -= 30;
        if (exam.maxAge && age > exam.maxAge) score -= 30;
        if (exam.minAge && exam.maxAge && age >= exam.minAge && age <= exam.maxAge) score += 15;
    }

    // 2. Qualification check (Simple keyword match for now)
    if (user.qualification && exam.title) {
        const qual = user.qualification.toLowerCase();
        const title = exam.title.toLowerCase();
        if (title.includes(qual)) score += 15;
    }

    // 3. Category match
    if (user.preferredCategories.includes(exam.category)) {
        score += 10;
    }

    return Math.min(100, Math.max(0, score));
}

export async function getUserExams(id: string, page: number = 1, limit: number = 20) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', `User "${id}" not found`);

    const where: Prisma.ExamWhereInput = {
        isPublished: true,
        // Category filter only when user has preferences
        ...(user.preferredCategories.length > 0 && {
            category: { in: user.preferredCategories },
        }),
        // State / level filter
        ...(user.preferredExamLevel === 'STATE' && user.state
            ? { state: { contains: user.state, mode: 'insensitive' as Prisma.QueryMode } }
            : user.preferredExamLevel === 'NATIONAL'
                ? { examLevel: 'NATIONAL' }
                : user.state
                    ? {
                        OR: [
                            { examLevel: 'NATIONAL' },
                            { state: { contains: user.state, mode: 'insensitive' as Prisma.QueryMode } },
                        ],
                    }
                    : {}),
    };

    const [exams, total] = await Promise.all([
        prisma.exam.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
            select: {
                id: true,
                title: true,
                shortTitle: true,
                slug: true,
                category: true,
                conductingBody: true,
                status: true,
                examLevel: true,
                state: true,
                totalVacancies: true,
                isPublished: true,
                publishedAt: true,
                createdAt: true,
                minAge: true,
                maxAge: true,
                _count: { select: { lifecycleEvents: true } },
                lifecycleEvents: {
                    where: {
                        eventType: 'REGISTRATION',
                    },
                    orderBy: { startsAt: 'asc' },
                    take: 1,
                    select: {
                        startsAt: true,
                        endsAt: true,
                        title: true,
                        eventType: true,
                        actionUrl: true,
                        actionLabel: true,
                    },
                },
            },
        }),
        prisma.exam.count({ where }),
    ]);

    // Add matchScore to each exam
    const examsWithScore = exams.map(exam => ({
        ...exam,
        matchScore: calculateMatchScore(user, exam)
    }));

    return { exams: examsWithScore, total, page, limit };
}

// ─── Toggle saved exam ────────────────────────────────────────
export async function toggleSavedExam(id: string, examId: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', `User "${id}" not found`);

    const alreadySaved = user.savedExamIds.includes(examId);
    const savedExamIds = alreadySaved
        ? user.savedExamIds.filter((eid) => eid !== examId)
        : [...user.savedExamIds, examId];

    return prisma.user.update({ where: { id }, data: { savedExamIds } });
}
