// ============================================================
// admin/constants/enums.ts — Mirroring backend enums
// ============================================================

export const ExamCategory = {
    UPSC: 'UPSC',
    SSC: 'SSC',
    BANKING: 'BANKING',
    RAILWAY: 'RAILWAY',
    DEFENCE: 'DEFENCE',
    STATE_PSC: 'STATE_PSC',
    TEACHING: 'TEACHING',
    POLICE: 'POLICE',
    MEDICAL: 'MEDICAL',
    ENGINEERING: 'ENGINEERING',
    LAW: 'LAW',
    OTHER: 'OTHER',
} as const;

export type ExamCategory = (typeof ExamCategory)[keyof typeof ExamCategory];

export const ExamLevel = {
    NATIONAL: 'NATIONAL',
    STATE: 'STATE',
    DISTRICT: 'DISTRICT',
    OTHER: 'OTHER',
} as const;

export type ExamLevel = (typeof ExamLevel)[keyof typeof ExamLevel];

export const ExamStatus = {
    UPCOMING: 'UPCOMING',
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const;

export type ExamStatus = (typeof ExamStatus)[keyof typeof ExamStatus];

export const LifecycleEventType = {
    NOTIFICATION_OUT: 'NOTIFICATION_OUT',
    REGISTRATION: 'REGISTRATION',
    CORRECTION_WINDOW: 'CORRECTION_WINDOW',
    EXAM_CITY_INTIMATION: 'EXAM_CITY_INTIMATION',
    ADMIT_CARD_RELEASE: 'ADMIT_CARD_RELEASE',
    EXAM_DATE: 'EXAM_DATE',
    ANSWER_KEY_PROVISIONAL: 'ANSWER_KEY_PROVISIONAL',
    ANSWER_KEY_FINAL: 'ANSWER_KEY_FINAL',
    RESULT: 'RESULT',
    SCORE_CARD_RELEASE: 'SCORE_CARD_RELEASE',
    CUTOFF_RELEASE: 'CUTOFF_RELEASE',
    PHYSICAL_TEST: 'PHYSICAL_TEST',
    SKILL_TEST: 'SKILL_TEST',
    INTERVIEW: 'INTERVIEW',
    DOCUMENT_VERIFICATION: 'DOCUMENT_VERIFICATION',
    FINAL_MERIT_LIST: 'FINAL_MERIT_LIST',
    JOINING_DATE: 'JOINING_DATE',
    OTHER: 'OTHER',
} as const;

export type LifecycleEventType = (typeof LifecycleEventType)[keyof typeof LifecycleEventType];

export const QualificationLevel = {
    TEN_PASS: '10TH_PASS',
    TWELVE_PASS: '12TH_PASS',
    GRADUATE: 'GRADUATE',
    POST_GRADUATE: 'POST_GRADUATE',
    PHD: 'PHD',
    OTHER: 'OTHER',
} as const;

export type QualificationLevel = (typeof QualificationLevel)[keyof typeof QualificationLevel];
