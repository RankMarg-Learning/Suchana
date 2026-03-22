import prisma from '../../config/database';
import { ReviewStatus } from '../../constants/enums';

export async function getReviewStats() {
    const [pendingCount, approvedCount, rejectedCount, needsCorrectionCount, duplicateCount, totalJobs] =
        await Promise.all([
            prisma.stagedExam.count({ where: { reviewStatus: ReviewStatus.PENDING, isDuplicate: false } }),
            prisma.stagedExam.count({ where: { reviewStatus: ReviewStatus.APPROVED } }),
            prisma.stagedExam.count({ where: { reviewStatus: ReviewStatus.REJECTED } }),
            prisma.stagedExam.count({ where: { reviewStatus: ReviewStatus.NEEDS_CORRECTION } }),
            prisma.stagedExam.count({ where: { isDuplicate: true } }),
            prisma.scrapeJob.count(),
        ]);

    const recentJobs = await prisma.scrapeJob.findMany({
        orderBy: { startedAt: 'desc' },
        take: 5,
        include: {
            scrapeSource: { select: { label: true } },
        },
    });

    return {
        reviewQueue: {
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
            needsCorrection: needsCorrectionCount,
            duplicates: duplicateCount,
        },
        totalJobs,
        recentJobs,
    };
}
