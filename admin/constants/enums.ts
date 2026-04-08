export const ExamCategory = {
    ENGINEERING_ENTRANCE: "ENGINEERING_ENTRANCE",
    MEDICAL_ENTRANCE: "MEDICAL_ENTRANCE",
    LAW_ENTRANCE: "LAW_ENTRANCE",
    MBA_ENTRANCE: "MBA_ENTRANCE",
    GOVERNMENT_JOBS: "GOVERNMENT_JOBS",
    BANKING_JOBS: "BANKING_JOBS",
    RAILWAY_JOBS: "RAILWAY_JOBS",
    DEFENCE_JOBS: "DEFENCE_JOBS",
    POLICE_JOBS: "POLICE_JOBS",
    TEACHING_ELIGIBILITY: "TEACHING_ELIGIBILITY",
    STATE_PSC: "STATE_PSC",
    UPSC: "UPSC",
    SSC: "SSC",
    PROFESSIONAL_CERTIFICATION: "PROFESSIONAL_CERTIFICATION",
    SCHOOL_BOARD: "SCHOOL_BOARD",
    SCHOLARSHIP_EXAMS: "SCHOLARSHIP_EXAMS",
    OLYMPIAD_EXAMS: "OLYMPIAD_EXAMS",
    AGRICULTURE_ENTRANCE: "AGRICULTURE_ENTRANCE",
    PARAMEDICAL_ENTRANCE: "PARAMEDICAL_ENTRANCE",
    FOREIGN_STUDY_EXAMS: "FOREIGN_STUDY_EXAMS",
    SKILL_CERTIFICATION: "SKILL_CERTIFICATION",
    UNIVERSITY_ENTRANCE: "UNIVERSITY_ENTRANCE",
    OTHER: "OTHER"
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
    NOTIFICATION: 'NOTIFICATION',
    REGISTRATION_OPEN: 'REGISTRATION_OPEN',
    REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
    ADMIT_CARD_COMING_SOON: 'ADMIT_CARD_COMING_SOON',
    ADMIT_CARD_OUT: 'ADMIT_CARD_OUT',
    EXAM_ONGOING: 'EXAM_ONGOING',
    EXAM_COMPLETED: 'EXAM_COMPLETED',
    ANSWER_KEY_OUT: 'ANSWER_KEY_OUT',
    RESULT_COMING_SOON: 'RESULT_COMING_SOON',
    RESULT_DECLARED: 'RESULT_DECLARED',
    ARCHIVED: 'ARCHIVED',
    ACTIVE: 'ACTIVE',
} as const;
export type ExamStatus = (typeof ExamStatus)[keyof typeof ExamStatus];
export const EXAM_STATUSES = Object.values(ExamStatus);

export const LifecycleStage = {
    NOTIFICATION: 'NOTIFICATION',
    REGISTRATION: 'REGISTRATION',
    CORRECTION_WINDOW: 'CORRECTION_WINDOW',
    ADMIT_CARD: 'ADMIT_CARD',
    EXAM: 'EXAM',
    EXAM_CITY: 'EXAM_CITY',
    ANSWER_KEY: 'ANSWER_KEY',
    RESULT: 'RESULT',
    DOCUMENT_VERIFICATION: 'DOCUMENT_VERIFICATION',
    JOINING: 'JOINING',
} as const;
export type LifecycleStage = (typeof LifecycleStage)[keyof typeof LifecycleStage];
export const LIFECYCLE_STAGES = Object.values(LifecycleStage);

export const STAGE_ORDER_MAP: Record<LifecycleStage, number> = {
    NOTIFICATION: 10,
    REGISTRATION: 20,
    CORRECTION_WINDOW: 30,
    ADMIT_CARD: 40,
    EXAM: 50,
    EXAM_CITY: 60,
    ANSWER_KEY: 70,
    RESULT: 80,
    DOCUMENT_VERIFICATION: 90,
    JOINING: 100,
};
 
export const DEFAULT_ACTION_LABELS: Record<string, string> = {
    NOTIFICATION: 'View Notification',
    REGISTRATION: 'Apply Now',
    CORRECTION_WINDOW: 'Edit Form',
    ADMIT_CARD: 'Download Admit Card',
    EXAM: 'View Schedule',
    EXAM_CITY: 'Check Exam City',
    ANSWER_KEY: 'View Answer Key',
    RESULT: 'Check Result',
    DOCUMENT_VERIFICATION: 'View Schedule',
    JOINING: 'View Joining Details',
};



// ─── Qualification Level ──────────────────────────────────────
export const QualificationLevel = {
    TEN_PASS: '10TH_PASS',
    TWELVE_PASS: '12TH_PASS',
    DIPLOMA: 'DIPLOMA',
    GRADUATE: 'GRADUATE',
    POST_GRADUATE: 'POST_GRADUATE',
    PHD: 'PHD',
    OTHER: 'OTHER',
} as const;
export type QualificationLevel = (typeof QualificationLevel)[keyof typeof QualificationLevel];

export const getStatusFromStage = (stage: string): ExamStatus | null => {
    if (stage === LifecycleStage.NOTIFICATION) return ExamStatus.NOTIFICATION;
    if (stage === LifecycleStage.REGISTRATION) return ExamStatus.REGISTRATION_OPEN;
    if (stage === LifecycleStage.CORRECTION_WINDOW) return ExamStatus.REGISTRATION_OPEN;
    if (stage === LifecycleStage.EXAM_CITY) return ExamStatus.ACTIVE;
    if (stage === LifecycleStage.ADMIT_CARD) return ExamStatus.ADMIT_CARD_OUT;
    if (stage === LifecycleStage.EXAM) return ExamStatus.EXAM_ONGOING;
    if (stage === LifecycleStage.ANSWER_KEY) return ExamStatus.ANSWER_KEY_OUT;
    if (stage === LifecycleStage.RESULT) return ExamStatus.RESULT_DECLARED;
    // DOCUMENT_VERIFICATION, JOINING → show ACTIVE (generic in-progress)
    return null;
};

/**
 * Status to show when this stage is the LAST completed event and
 * there are no more future events (terminal state before archival).
 * Only called for the final event, after its window has closed.
 */
export const getTerminalStatusFromStage = (stage: string): ExamStatus => {
    if (stage === LifecycleStage.REGISTRATION) return ExamStatus.REGISTRATION_CLOSED;
    if (stage === LifecycleStage.EXAM) return ExamStatus.EXAM_COMPLETED;
    if (stage === LifecycleStage.RESULT) return ExamStatus.RESULT_DECLARED;
    if (stage === LifecycleStage.DOCUMENT_VERIFICATION) return ExamStatus.RESULT_DECLARED;
    if (stage === LifecycleStage.JOINING) return ExamStatus.RESULT_DECLARED;
    // Everything else that ends last → ACTIVE (e.g. exam day was last listed event)
    return ExamStatus.ACTIVE;
};

export const SeoPageCategory = {
    NOTIFICATION: 'NOTIFICATION',
    ADMIT_CARD: 'ADMIT_CARD',
    RESULT: 'RESULT',
    ANSWER_KEY: 'ANSWER_KEY',
    CUTOFF: 'CUTOFF',
    SYLLABUS: 'SYLLABUS',
    EXAM_PATTERN: 'EXAM_PATTERN',
    ELIGIBILITY: 'ELIGIBILITY',
    SALARY: 'SALARY',
    VACANCY: 'VACANCY',
    APPLICATION_FORM: 'APPLICATION_FORM',
    BOOKS: 'BOOKS',
    PREPARATION_STRATEGY: 'PREPARATION_STRATEGY',
    PREVIOUS_YEAR_PAPER: 'PREVIOUS_YEAR_PAPER',
    MOCK_TEST: 'MOCK_TEST',
    ANALYSIS: 'ANALYSIS',
    COUNSELLING: 'COUNSELLING',
    DOCUMENT_VERIFICATION: 'DOCUMENT_VERIFICATION',
    MERIT_LIST: 'MERIT_LIST',
    SCORECARD: 'SCORECARD',
    IMPORTANT_DATES: 'IMPORTANT_DATES',
    SELECTION_PROCESS: 'SELECTION_PROCESS',
    AGE_LIMIT: 'AGE_LIMIT',
    APPLICATION_FEE: 'APPLICATION_FEE',
    STATE_EXAMS: 'STATE_EXAMS',
    CENTRAL_EXAMS: 'CENTRAL_EXAMS',
    CURRENT_AFFAIRS: 'CURRENT_AFFAIRS',
    GK_STATIC: 'GK_STATIC',
    TOOL: 'TOOL',
    COMPARISON: 'COMPARISON',
    GUIDE: 'GUIDE',
    OTHERS: 'OTHERS',
} as const;

export type SeoPageCategory = (typeof SeoPageCategory)[keyof typeof SeoPageCategory];
export const SEO_PAGE_CATEGORIES = Object.values(SeoPageCategory);

