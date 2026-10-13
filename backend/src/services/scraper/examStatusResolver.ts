import { ExamStatus, LifecycleStage, getStatusFromStage, getTerminalStatusFromStage } from '../../constants/enums';

export interface StatusResolvingEvent {
    stage: string;
    stageOrder?: number;
    startsAt?: Date | null;
    endsAt?: Date | null;
    isTBD?: boolean;
    actionUrl?: string | null;
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

        // 1. High-priority official link / section presence checks
        const resultEv = events.find((e) => e.stage === LifecycleStage.RESULT);
        if (resultEv) {
            const hasResultLink = Boolean(resultEv.actionUrl && resultEv.actionUrl.trim().length > 0);
            const isResultPastOrToday = Boolean(resultEv.startsAt && toDayStart(resultEv.startsAt) <= nowMs);
            if (hasResultLink || isResultPastOrToday || sectionHint === 'RESULTS') {
                return ExamStatus.RESULT_DECLARED;
            }
        } else if (sectionHint === 'RESULTS') {
            return ExamStatus.RESULT_DECLARED;
        }

        const answerKeyEv = events.find((e) => e.stage === LifecycleStage.ANSWER_KEY);
        if (answerKeyEv) {
            const hasAnswerLink = Boolean(answerKeyEv.actionUrl && answerKeyEv.actionUrl.trim().length > 0);
            const isAnswerPastOrToday = Boolean(answerKeyEv.startsAt && toDayStart(answerKeyEv.startsAt) <= nowMs);
            if (hasAnswerLink || isAnswerPastOrToday || sectionHint === 'ANSWER_KEY') {
                return ExamStatus.ANSWER_KEY_OUT;
            }
        } else if (sectionHint === 'ANSWER_KEY') {
            return ExamStatus.ANSWER_KEY_OUT;
        }

        const admitCardEv = events.find((e) => e.stage === LifecycleStage.ADMIT_CARD);
        if (admitCardEv) {
            const hasAdmitLink = Boolean(admitCardEv.actionUrl && admitCardEv.actionUrl.trim().length > 0);
            const isAdmitPastOrToday = Boolean(admitCardEv.startsAt && toDayStart(admitCardEv.startsAt) <= nowMs);
            if (hasAdmitLink || isAdmitPastOrToday || sectionHint === 'ADMIT_CARDS') {
                // If exam has already finished, check if answer key or result applies
                const examEv = events.find((e) => e.stage === LifecycleStage.EXAM);
                if (examEv?.startsAt && toDayEnd(examEv.startsAt, examEv.endsAt) < nowMs) {
                    return ExamStatus.EXAM_COMPLETED;
                }
                return ExamStatus.ADMIT_CARD_OUT;
            }
        } else if (sectionHint === 'ADMIT_CARDS') {
            return ExamStatus.ADMIT_CARD_OUT;
        }

        // 2. Chronological window evaluation
        const sorted = [...events].sort((a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0));

        // Check if currently inside any active event window
        for (let i = sorted.length - 1; i >= 0; i--) {
            const ev = sorted[i];
            if (!ev.startsAt) continue;

            const wStart = toDayStart(ev.startsAt);
            const wEnd = toDayEnd(ev.startsAt, ev.endsAt);

            if (nowMs >= wStart && nowMs <= wEnd) {
                const stageStatus = getStatusFromStage(ev.stage);
                if (stageStatus) return stageStatus;
                return ExamStatus.ACTIVE;
            }
        }

        // Find the most recent past event
        let latestPastIdx = -1;
        for (let i = 0; i < sorted.length; i++) {
            if (sorted[i].startsAt && toDayStart(sorted[i].startsAt!) <= nowMs) {
                latestPastIdx = i;
            }
        }

        // If no event has started yet
        if (latestPastIdx === -1) {
            return ExamStatus.NOTIFICATION;
        }

        const latestPast = sorted[latestPastIdx];
        const isLastEvent = latestPastIdx === sorted.length - 1;
        const wEnd = toDayEnd(latestPast.startsAt!, latestPast.endsAt);

        // If there are future events scheduled
        if (!isLastEvent) {
            const nextEvent = sorted[latestPastIdx + 1];

            if (nextEvent.stage === LifecycleStage.ADMIT_CARD) {
                return ExamStatus.ADMIT_CARD_COMING_SOON;
            }
            if (nextEvent.stage === LifecycleStage.RESULT) {
                return ExamStatus.RESULT_COMING_SOON;
            }
            if (nextEvent.stage === LifecycleStage.EXAM) {
                // Between admit card and exam
                if (latestPast.stage === LifecycleStage.ADMIT_CARD) {
                    return ExamStatus.ADMIT_CARD_OUT;
                }
                // Between registration end and exam
                if (latestPast.stage === LifecycleStage.REGISTRATION) {
                    return ExamStatus.REGISTRATION_CLOSED;
                }
            }

            return getTerminalStatusFromStage(latestPast.stage);
        }

        // Final event completed: check archival threshold (14 days)
        if (nowMs - wEnd > ARCHIVE_AFTER_MS) {
            return ExamStatus.ARCHIVED;
        }

        return getTerminalStatusFromStage(latestPast.stage);
    }
}
