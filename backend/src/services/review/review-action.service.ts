import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { ReviewStatus } from '../../constants/enums';
import { logger } from '../../utils/logger';
import { promoteStagedExam } from './promotion.service';
import type { ReviewDecisionDto } from '../../schemas/scraper.schema';

export async function reviewStagedExam(
    id: string,
    dto: ReviewDecisionDto,
    adminId: string,
): Promise<{ stagedExam: unknown; examId?: string }> {
    const staged = await prisma.stagedExam.findUnique({ where: { id } });
    if (!staged) throw new AppError(404, 'NOT_FOUND', `StagedExam ${id} not found`);

    if (staged.reviewStatus === ReviewStatus.APPROVED) {
        throw new AppError(409, 'ALREADY_APPROVED', `StagedExam ${id} is already approved`);
    }

    const updatedStaged = await prisma.stagedExam.update({
        where: { id },
        data: {
            reviewStatus: dto.decision,
            reviewNote: dto.reviewNote,
            reviewedBy: adminId,
            reviewedAt: new Date(),
            ...(dto.corrections?.title && { title: dto.corrections.title }),
            ...(dto.corrections?.shortTitle && { shortTitle: dto.corrections.shortTitle }),
            ...(dto.corrections?.conductingBody && { conductingBody: dto.corrections.conductingBody }),
            ...(dto.corrections?.category && { category: dto.corrections.category }),
            ...(dto.corrections?.examLevel && { examLevel: dto.corrections.examLevel }),
            ...(dto.corrections?.totalVacancies !== undefined && {
                totalVacancies: dto.corrections.totalVacancies,
            }),
            ...(dto.corrections?.salary !== undefined && { salary: dto.corrections.salary }),
            ...(dto.corrections?.additionalDetails !== undefined && { additionalDetails: dto.corrections.additionalDetails }),
            ...(dto.corrections?.description && { description: dto.corrections.description }),
            ...(dto.corrections?.officialWebsite && { officialWebsite: dto.corrections.officialWebsite }),
            ...(dto.corrections?.notificationUrl && { notificationUrl: dto.corrections.notificationUrl }),
        },
    });

    logger.info(
        `[Review] StagedExam ${id} → ${dto.decision} by admin ${adminId}. Note: ${dto.reviewNote ?? 'none'}`,
    );

    if (dto.decision === ReviewStatus.APPROVED) {
        await prisma.stagedExam.update({
            where: { id },
            data: { reviewStatus: ReviewStatus.APPROVED },
        });

        const { examId } = await promoteStagedExam(id, adminId);
        logger.info(`[Review] StagedExam ${id} promoted to Exam ${examId}`);
        return { stagedExam: updatedStaged, examId };
    }

    return { stagedExam: updatedStaged };
}
