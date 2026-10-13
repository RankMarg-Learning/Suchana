import prisma from '../../config/database';
import { logger } from '../../utils/logger';
import { EXAM_CATEGORIES, EXAM_LEVELS, LIFECYCLE_STAGES, ExamStatus } from '../../constants/enums';
import { RuleEngineService } from './rules/ruleEngine.service';
import { ExamStatusResolver } from './examStatusResolver';
import { promoteStagedExam } from '../review/promotion.service';
import { cacheService } from '../../utils/cache';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    derivedStatus: ExamStatus;
}

export interface AutoPromotionResult {
    isValid: boolean;
    promoted: boolean;
    stagedExamId: string;
    examId?: string;
    status?: string;
    errors?: string[];
    warnings?: string[];
}

export class ExamValidationService {
    /**
     * Performs strict, multi-layer validation checks on a StagedExam and its events
     * to guarantee that only production-grade, authoritative exam data is published.
     */
    static validate(
        staged: {
            id: string;
            title: string;
            shortTitle?: string | null;
            category?: string | null;
            conductingBody?: string | null;
            examLevel?: string | null;
            state?: string | null;
            examYear?: number | null;
            officialWebsite?: string | null;
            notificationUrl?: string | null;
            totalVacancies?: string | null;
            applicationFee?: string | null;
            age?: string | null;
        },
        events: {
            stage: string;
            stageOrder: number;
            title: string;
            startsAt?: Date | null;
            endsAt?: Date | null;
            isTBD?: boolean;
            actionUrl?: string | null;
            actionLabel?: string | null;
        }[],
        sectionHint?: string
    ): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const rules = RuleEngineService.getRules();
        const currentYear = new Date().getFullYear();

        // 1. Title & Short Title Validation
        if (!staged.title || staged.title.trim().length < 5) {
            errors.push('Exam title is missing or too short (< 5 chars)');
        }
        if (!staged.shortTitle || staged.shortTitle.trim().length < 3) {
            errors.push('Exam shortTitle is missing or too short (< 3 chars)');
        }

        // Prohibited Brand Keywords check in titles
        for (const brand of rules.cleaning.brandKeywordsToRemove) {
            if (staged.title?.toLowerCase().includes(brand.toLowerCase())) {
                errors.push(`Title contains prohibited source branding keyword: "${brand}"`);
            }
            if (staged.shortTitle?.toLowerCase().includes(brand.toLowerCase())) {
                errors.push(`ShortTitle contains prohibited source branding keyword: "${brand}"`);
            }
        }

        // 2. Conducting Body Validation
        if (!staged.conductingBody || staged.conductingBody.trim().length < 3 || /unknown/i.test(staged.conductingBody)) {
            errors.push('Conducting body is missing or set to Unknown');
        }

        // 3. Category Validation
        if (!staged.category || !EXAM_CATEGORIES.includes(staged.category as any)) {
            errors.push(`Category "${staged.category}" is not a valid EXAM_CATEGORIES enum`);
        }

        // 4. Exam Level & State Validation
        if (!staged.examLevel || !EXAM_LEVELS.includes(staged.examLevel as any)) {
            errors.push(`Exam level "${staged.examLevel}" is not a valid EXAM_LEVELS enum`);
        } else if (staged.examLevel === 'STATE' && (!staged.state || staged.state.trim().length < 2)) {
            errors.push('Exam is marked as STATE level, but state field is missing or empty');
        }

        // 5. Lifecycle Events Validation (CRITICAL)
        if (!events || events.length === 0) {
            errors.push('Exam has no lifecycle events');
        } else {
            let hasAnyConcreteDateOrActionLink = false;

            for (const ev of events) {
                if (!LIFECYCLE_STAGES.includes(ev.stage as any)) {
                    errors.push(`Event stage "${ev.stage}" is not a valid LIFECYCLE_STAGES enum`);
                }

                if (!ev.title || ev.title.trim().length < 2) {
                    errors.push(`Event in stage "${ev.stage}" has an empty title`);
                }

                // Date sanity check
                if (ev.startsAt && ev.endsAt) {
                    if (new Date(ev.endsAt).getTime() < new Date(ev.startsAt).getTime()) {
                        errors.push(`Event in stage "${ev.stage}" has endsAt (${ev.endsAt}) before startsAt (${ev.startsAt})`);
                    }
                }

                // Date year bounds check (e.g. within currentYear - 2 to currentYear + 4)
                if (ev.startsAt) {
                    const startYear = new Date(ev.startsAt).getFullYear();
                    if (startYear < currentYear - 2 || startYear > currentYear + 4) {
                        warnings.push(`Event "${ev.title}" startsAt year (${startYear}) is unusually outside current year window`);
                    }
                }

                if ((ev.startsAt && !ev.isTBD) || (ev.actionUrl && ev.actionUrl.trim().length > 0)) {
                    hasAnyConcreteDateOrActionLink = true;
                }

                // Security check on event actionUrl
                if (ev.actionUrl) {
                    const lowerUrl = ev.actionUrl.toLowerCase();
                    for (const blacklisted of rules.cleaning.blacklistedLinkDomains) {
                        if (lowerUrl.includes(blacklisted)) {
                            errors.push(`Event actionUrl contains blacklisted domain "${blacklisted}": ${ev.actionUrl}`);
                        }
                    }
                }
            }

            if (!hasAnyConcreteDateOrActionLink) {
                errors.push('Exam has no events with concrete dates or active action URLs');
            }
        }

        // 6. Official Links Validation
        const allLinks = [staged.officialWebsite, staged.notificationUrl].filter(Boolean) as string[];
        for (const link of allLinks) {
            const lowerLink = link.toLowerCase();
            for (const blacklisted of rules.cleaning.blacklistedLinkDomains) {
                if (lowerLink.includes(blacklisted)) {
                    errors.push(`Official link contains blacklisted domain "${blacklisted}": ${link}`);
                }
            }
        }

        const hasAnyActionableLink =
            Boolean(staged.officialWebsite) ||
            Boolean(staged.notificationUrl) ||
            events.some((e) => Boolean(e.actionUrl));

        if (!hasAnyActionableLink) {
            warnings.push('Exam has no official website, notification URL, or event action links');
        }

        // 7. Resolve proper status using ExamStatusResolver
        const derivedStatus = ExamStatusResolver.resolveStatus(events, new Date(), sectionHint);

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            derivedStatus,
        };
    }

    /**
     * Checks validation and automatically promotes a StagedExam to the main Exam table.
     * Only properly validated content is moved and published!
     */
    static async validateAndPromote(
        stagedExamId: string,
        adminId: string = 'system_auto_validator',
        sectionHint?: string
    ): Promise<AutoPromotionResult> {
        const staged = await prisma.stagedExam.findUnique({
            where: { id: stagedExamId },
            include: { stagedEvents: { orderBy: { stageOrder: 'asc' } } },
        });

        if (!staged) {
            return {
                isValid: false,
                promoted: false,
                stagedExamId,
                errors: [`StagedExam ${stagedExamId} not found`],
            };
        }

        // 1. Run strict validation
        const validation = this.validate(staged, staged.stagedEvents, sectionHint);

        if (!validation.isValid) {
            logger.warn(
                `[AutoValidator] StagedExam ${stagedExamId} ("${staged.title}") failed validation. Stays PENDING:\n` +
                validation.errors.map((e) => `  - ${e}`).join('\n')
            );

            // Record validation errors in reviewNote so admins can see why it didn't auto-publish
            await prisma.stagedExam.update({
                where: { id: stagedExamId },
                data: {
                    reviewStatus: 'PENDING',
                    reviewNote: `Auto-validation blocked:\n${validation.errors.map((e) => `• ${e}`).join('\n')}`,
                },
            });

            return {
                isValid: false,
                promoted: false,
                stagedExamId,
                errors: validation.errors,
                warnings: validation.warnings,
            };
        }

        // 2. Validation Passed! Update StagedExam to APPROVED with proper derived status
        logger.info(
            `[AutoValidator] StagedExam ${stagedExamId} ("${staged.title}") passed all validation checks! ` +
            `Derived status: ${validation.derivedStatus}`
        );

        await prisma.stagedExam.update({
            where: { id: stagedExamId },
            data: {
                reviewStatus: 'APPROVED',
                status: validation.derivedStatus,
                reviewedBy: adminId,
                reviewedAt: new Date(),
                reviewNote: `Auto-validated and approved by validation engine.\nStatus: ${validation.derivedStatus}`,
            },
        });

        // 3. Promote into main Exam table
        const { examId } = await promoteStagedExam(stagedExamId, adminId);

        // 4. Update the published Exam record with proper derived status and isPublished: true
        await prisma.exam.update({
            where: { id: examId },
            data: {
                status: validation.derivedStatus,
                isPublished: true,
                publishedAt: new Date(),
            },
        });

        // 5. Invalidate cache
        await cacheService.delPattern('exams:*');

        logger.info(`[AutoValidator] Successfully moved and published Exam ${examId} with status ${validation.derivedStatus}!`);

        return {
            isValid: true,
            promoted: true,
            stagedExamId,
            examId,
            status: validation.derivedStatus,
            warnings: validation.warnings,
        };
    }
}
