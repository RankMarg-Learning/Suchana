export const ExamCategory = {
    BANKING: 'BANKING',    // SBI, IBPS, RBI, NABARD
    SSC: 'SSC',        // SSC CGL, CHSL, MTS, GD
    RAILWAYS: 'RAILWAYS',   // RRB NTPC, Group D, ALP
    UPSC: 'UPSC',       // Civil Services, CAPF, CDS, NDA
    STATE_PSC: 'STATE_PSC',  // BPSC, UPPSC, MPSC, RPSC
    DEFENCE: 'DEFENCE',    // NDA, CDS, AFCAT, Navy
    TEACHING: 'TEACHING',   // CTET, STET, KVS, NVS
    POLICE: 'POLICE',     // UP Police, Delhi Police, CRPF
    INSURANCE: 'INSURANCE',  // LIC, NIACL, GIC
    OTHER: 'OTHER',
} as const;

export type ExamCategory = (typeof ExamCategory)[keyof typeof ExamCategory];

export const ExamLevel = {
    NATIONAL: 'NATIONAL',
    STATE: 'STATE',
    DISTRICT: 'DISTRICT',
} as const;

export type ExamLevel = (typeof ExamLevel)[keyof typeof ExamLevel];

export const ExamStatus = {
    UPCOMING: 'UPCOMING',
    REGISTRATION_OPEN: 'REGISTRATION_OPEN',
    REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
    ADMIT_CARD_OUT: 'ADMIT_CARD_OUT',
    EXAM_ONGOING: 'EXAM_ONGOING',
    RESULT_DECLARED: 'RESULT_DECLARED',
    ARCHIVED: 'ARCHIVED',
} as const;

export type ExamStatus = (typeof ExamStatus)[keyof typeof ExamStatus];

export const LifecycleStage = {
    NOTIFICATION: 'NOTIFICATION',
    REGISTRATION: 'REGISTRATION',
    ADMIT_CARD: 'ADMIT_CARD',
    EXAM: 'EXAM',
    ANSWER_KEY: 'ANSWER_KEY',
    RESULT: 'RESULT',
    DOCUMENT_VERIFICATION: 'DOCUMENT_VERIFICATION',
    JOINING: 'JOINING',
} as const;

export type LifecycleStage = (typeof LifecycleStage)[keyof typeof LifecycleStage];

export const STAGE_ORDER_MAP: Record<LifecycleStage, number> = {
    NOTIFICATION: 10,
    REGISTRATION: 20,
    ADMIT_CARD: 30,
    EXAM: 40,
    ANSWER_KEY: 50,
    RESULT: 60,
    DOCUMENT_VERIFICATION: 70,
    JOINING: 80,
};

export const LifecycleEventType = {
    RELEASE: 'RELEASE',     // Notification out, admit card released, result out
    START: 'START',       // Registration window opens, exam starts
    END: 'END',         // Last date to apply, form submission closes
    CORRECTION: 'CORRECTION',  // Form correction window
    RESCHEDULED: 'RESCHEDULED', // Event date changed
    CANCELLED: 'CANCELLED',   // Event cancelled
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
