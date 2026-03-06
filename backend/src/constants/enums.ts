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
export const EXAM_CATEGORIES = Object.values(ExamCategory);


export const ExamLevel = {
    NATIONAL: 'NATIONAL',
    STATE: 'STATE',
    DISTRICT: 'DISTRICT',
} as const;
export type ExamLevel = (typeof ExamLevel)[keyof typeof ExamLevel];
export const EXAM_LEVELS = Object.values(ExamLevel);


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
export const EXAM_STATUSES = Object.values(ExamStatus);

export const LifecycleStage = {
    NOTIFICATION: 'NOTIFICATION',           // stageOrder: 10
    REGISTRATION: 'REGISTRATION',           // stageOrder: 20
    ADMIT_CARD: 'ADMIT_CARD',             // stageOrder: 30
    EXAM: 'EXAM',                   // stageOrder: 40
    ANSWER_KEY: 'ANSWER_KEY',             // stageOrder: 50
    RESULT: 'RESULT',                 // stageOrder: 60
    DOCUMENT_VERIFICATION: 'DOCUMENT_VERIFICATION',  // stageOrder: 70
    JOINING: 'JOINING',                // stageOrder: 80
} as const;
export type LifecycleStage = (typeof LifecycleStage)[keyof typeof LifecycleStage];
export const LIFECYCLE_STAGES = Object.values(LifecycleStage);

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

// ─── Event Type (fine-grained within a stage) ─────────────────
// Used: LifecycleEvent.eventType, StagedLifecycleEvent.eventType
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
export const LIFECYCLE_EVENT_TYPES = Object.values(LifecycleEventType);

// ─── Staged Exam Review Status ────────────────────────────────
// Used: StagedExam.reviewStatus
export const ReviewStatus = {
    PENDING: 'PENDING',           // AI structured, waiting for admin
    APPROVED: 'APPROVED',          // Admin approved, moved to Exam table
    REJECTED: 'REJECTED',          // Admin rejected
    NEEDS_CORRECTION: 'NEEDS_CORRECTION',  // Admin flagged for AI re-extraction
} as const;
export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];
export const REVIEW_STATUSES = Object.values(ReviewStatus);

// ─── Scrape Job Status ─────────────────────────────────────────
// Used: ScrapeJob.status
export const ScrapeJobStatus = {
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    PARTIAL: 'PARTIAL',   // Some URLs succeeded, some failed
} as const;
export type ScrapeJobStatus = (typeof ScrapeJobStatus)[keyof typeof ScrapeJobStatus];

// ─── Scrape Source Type ────────────────────────────────────────
// Used: ScrapeSource.sourceType
export const ScrapeSourceType = {
    LISTING: 'LISTING',  // Page lists multiple exam notifications
    DETAIL: 'DETAIL',   // Page is about a single exam
} as const;
export type ScrapeSourceType = (typeof ScrapeSourceType)[keyof typeof ScrapeSourceType];

// ─── Notification Status ──────────────────────────────────────
// Used: NotificationLog.status
export const NotificationStatus = {
    PENDING: 'PENDING',
    SENT: 'SENT',
    PARTIAL: 'PARTIAL',
    FAILED: 'FAILED',
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

// ─── Push Platform ─────────────────────────────────────────────
// Used: PushToken.platform, User.platform
export const PushPlatform = {
    ANDROID: 'ANDROID',
    IOS: 'IOS',
} as const;
export type PushPlatform = (typeof PushPlatform)[keyof typeof PushPlatform];

// ─── Qualification Level ──────────────────────────────────────
// Used: User.qualification
export const QualificationLevel = {
    TEN_PASS: '10TH_PASS',
    TWELVE_PASS: '12TH_PASS',
    GRADUATE: 'GRADUATE',
    POST_GRADUATE: 'POST_GRADUATE',
    PHD: 'PHD',
    OTHER: 'OTHER',
} as const;
export type QualificationLevel = (typeof QualificationLevel)[keyof typeof QualificationLevel];

