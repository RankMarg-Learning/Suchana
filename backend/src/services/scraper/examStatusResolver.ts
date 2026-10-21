import { ExamStatus, LifecycleStage, getStatusFromStage, getTerminalStatusFromStage } from '../../constants/enums';

export interface StatusResolvingEvent {
    stage: string;
    stageOrder?: number;
    startsAt?: Date | null;
    endsAt?: Date | null;
    isTBD?: boolean;
    actionUrl?: string | null;
    description?: string | null;
}

const ARCHIVE_AFTER_MS = 14 * 24 * 60 * 60 * 1000; // 14 days after final stage closes

const toDayStart = (d: Date): number => {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c.getTime();
};

const toDayEnd = (startsAt: Date, endsAt?: Date | null): number => {
    const base = endsAt ? new Date(endsAt) : new Date(startsAt);
    base.setHours(23, 59, 59, 999);
    return base.getTime();
};

export class ExamStatusResolver {
    /**
     * Resolves the proper exam status based on:
     * 1. Official action URLs (e.g. Result PDF announced, Admit card download live, Answer key live)
     * 2. Live event time windows (startsAt <= now <= endsAt)
     * 3. Upcoming event stages (e.g. Admit card coming soon, Result coming soon)
     * 4. Homepage section hint (e.g. RESULTS, ADMIT_CARDS, ANSWER_KEY)
     */
    static resolveStatus(
        events: StatusResolvingEvent[],
        now: Date = new Date(),
        sectionHint?: string
    ): ExamStatus {
        const nowMs = now.getTime();

        // 1. Live Registration Window Check (Highest action priority: if application is live, user must apply)
        const regEv = events.find((e) => e.stage === LifecycleStage.REGISTRATION);
        if (regEv?.startsAt) {
            const regStart = toDayStart(new Date(regEv.startsAt));
            const regEnd = toDayEnd(new Date(regEv.startsAt), regEv.endsAt ? new Date(regEv.endsAt) : null);
            if (nowMs >= regStart && nowMs <= regEnd) {
                return ExamStatus.REGISTRATION_OPEN;
            }
        }

        // 2. Live Exam Window Check (Examination phase currently active)
        const examEv = events.find((e) => e.stage === LifecycleStage.EXAM);
        if (examEv?.startsAt) {
            const examStart = toDayStart(new Date(examEv.startsAt));
            const examEnd = toDayEnd(new Date(examEv.startsAt), examEv.endsAt ? new Date(examEv.endsAt) : null);
            if (nowMs >= examStart && nowMs <= examEnd) {
                return ExamStatus.EXAM_ONGOING;
            }
        }

        // 3. Result Declared Check
        // Only declared if genuine actionUrl exists OR (confirmed past result date, not TBD, and exam has ended)
        const resultEv = events.find((e) => e.stage === LifecycleStage.RESULT);
        if (resultEv) {
            const hasResultLink = Boolean(
                resultEv.actionUrl &&
                resultEv.actionUrl.trim().length > 0 &&
                !resultEv.actionUrl.includes('activate-soon')
            );
            const isPlaceholder = Boolean(
                resultEv.description &&
                /(?:will be update|available soon|link activate|to be announced)/i.test(resultEv.description)
            );
            const isExamPast = !examEv?.startsAt || toDayEnd(new Date(examEv.startsAt), examEv.endsAt ? new Date(examEv.endsAt) : null) <= nowMs;
            const isResultPastOrToday = Boolean(
                resultEv.startsAt &&
                toDayStart(new Date(resultEv.startsAt)) <= nowMs &&
                !resultEv.isTBD &&
                !isPlaceholder &&
                isExamPast
            );

            if (hasResultLink || isResultPastOrToday) {
                const resultDate = resultEv.startsAt ? new Date(resultEv.startsAt) : now;
                const wEnd = toDayEnd(resultDate, resultEv.endsAt ? new Date(resultEv.endsAt) : null);
                if (nowMs - wEnd > ARCHIVE_AFTER_MS) {
                    return ExamStatus.ARCHIVED;
                }
                return ExamStatus.RESULT_DECLARED;
            }
        }

        // 4. Answer Key Out Check
        const answerKeyEv = events.find((e) => e.stage === LifecycleStage.ANSWER_KEY);
        if (answerKeyEv) {
            const hasAnswerLink = Boolean(
                answerKeyEv.actionUrl &&
                answerKeyEv.actionUrl.trim().length > 0 &&
                !answerKeyEv.actionUrl.includes('activate-soon')
            );
            const isAnswerPastOrToday = Boolean(
                answerKeyEv.startsAt &&
                toDayStart(new Date(answerKeyEv.startsAt)) <= nowMs &&
                !answerKeyEv.isTBD
            );
            if (hasAnswerLink || isAnswerPastOrToday || sectionHint === 'ANSWER_KEY') {
                return ExamStatus.ANSWER_KEY_OUT;
            }
        }

        // 5. Admit Card Out Check
        const admitCardEv = events.find((e) => e.stage === LifecycleStage.ADMIT_CARD);
        if (admitCardEv) {
            const hasAdmitLink = Boolean(
                admitCardEv.actionUrl &&
                admitCardEv.actionUrl.trim().length > 0 &&
                !admitCardEv.actionUrl.includes('activate-soon')
            );
            const isAdmitPastOrToday = Boolean(
                admitCardEv.startsAt &&
                toDayStart(new Date(admitCardEv.startsAt)) <= nowMs &&
                !admitCardEv.isTBD
            );
            if (hasAdmitLink || isAdmitPastOrToday || sectionHint === 'ADMIT_CARDS') {
                const isExamFinished = Boolean(
                    examEv?.startsAt &&
                    toDayEnd(new Date(examEv.startsAt), examEv.endsAt ? new Date(examEv.endsAt) : null) < nowMs
                );
                if (isExamFinished) {
                    return ExamStatus.EXAM_COMPLETED;
                }
                return ExamStatus.ADMIT_CARD_OUT;
            }
        }

        // 6. Stage transition checks
        if (examEv?.startsAt) {
            const examEnd = toDayEnd(new Date(examEv.startsAt), examEv.endsAt ? new Date(examEv.endsAt) : null);
            if (examEnd < nowMs) {
                return ExamStatus.RESULT_COMING_SOON;
            }
        }

        if (regEv?.endsAt) {
            const regEnd = toDayEnd(new Date(regEv.endsAt));
            if (regEnd < nowMs) {
                return ExamStatus.ADMIT_CARD_COMING_SOON;
            }
        }

        if (regEv?.startsAt && toDayStart(new Date(regEv.startsAt)) > nowMs) {
            return ExamStatus.NOTIFICATION;
        }

        // Chronological window evaluation fallback
        const sorted = [...events].sort((a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0));
        for (let i = sorted.length - 1; i >= 0; i--) {
            const ev = sorted[i];
            if (!ev.startsAt) continue;

            const wStart = toDayStart(new Date(ev.startsAt));
            const wEnd = toDayEnd(new Date(ev.startsAt), ev.endsAt ? new Date(ev.endsAt) : null);

            if (nowMs >= wStart && nowMs <= wEnd) {
                const stageStatus = getStatusFromStage(ev.stage);
                if (stageStatus) return stageStatus;
                return ExamStatus.ACTIVE;
            }
        }

        let latestPastIdx = -1;
        for (let i = 0; i < sorted.length; i++) {
            if (sorted[i].startsAt && toDayStart(new Date(sorted[i].startsAt!)) <= nowMs) {
                latestPastIdx = i;
            }
        }

        if (latestPastIdx === -1) {
            return ExamStatus.NOTIFICATION;
        }

        const latestPast = sorted[latestPastIdx];
        const isLastEvent = latestPastIdx === sorted.length - 1;
        const wEnd = toDayEnd(new Date(latestPast.startsAt!), latestPast.endsAt ? new Date(latestPast.endsAt) : null);

        if (!isLastEvent) {
            const nextEvent = sorted[latestPastIdx + 1];
            if (nextEvent.stage === LifecycleStage.ADMIT_CARD) {
                return ExamStatus.ADMIT_CARD_COMING_SOON;
            }
            if (nextEvent.stage === LifecycleStage.RESULT) {
                return ExamStatus.RESULT_COMING_SOON;
            }
            if (nextEvent.stage === LifecycleStage.EXAM) {
                if (latestPast.stage === LifecycleStage.ADMIT_CARD) {
                    return ExamStatus.ADMIT_CARD_OUT;
                }
                if (latestPast.stage === LifecycleStage.REGISTRATION) {
                    return ExamStatus.REGISTRATION_CLOSED;
                }
            }
            return getTerminalStatusFromStage(latestPast.stage);
        }

        if (nowMs - wEnd > ARCHIVE_AFTER_MS) {
            return ExamStatus.ARCHIVED;
        }

        return getTerminalStatusFromStage(latestPast.stage);
    }
}
