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
    ADMIT_CARD_OUT: 'ADMIT_CARD_OUT',
    EXAM_ONGOING: 'EXAM_ONGOING',
    RESULT_DECLARED: 'RESULT_DECLARED',
    ARCHIVED: 'ARCHIVED',
    ACTIVE: 'ACTIVE',
} as const;
export type ExamStatus = (typeof ExamStatus)[keyof typeof ExamStatus];
export const EXAM_STATUSES = Object.values(ExamStatus);

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
 
export const DEFAULT_ACTION_LABELS: Record<string, string> = {
    NOTIFICATION: 'View Notification',
    REGISTRATION: 'Apply Now',
    ADMIT_CARD: 'Download Admit Card',
    EXAM: 'View Schedule',
    ANSWER_KEY: 'View Answer Key',
    RESULT: 'Check Result',
    DOCUMENT_VERIFICATION: 'View Schedule',
    JOINING: 'View Joining Details',
};

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
export const QUALIFICATION_LEVELS = Object.values(QualificationLevel);

export const getStatusFromStage = (stage: string): ExamStatus | null => {
    if (stage === LifecycleStage.REGISTRATION) return ExamStatus.REGISTRATION_OPEN;
    if (stage === LifecycleStage.ADMIT_CARD) return ExamStatus.ADMIT_CARD_OUT;
    if (stage === LifecycleStage.EXAM) return ExamStatus.EXAM_ONGOING;
    if (stage === LifecycleStage.RESULT) return ExamStatus.RESULT_DECLARED;
    if (stage === LifecycleStage.NOTIFICATION) return ExamStatus.NOTIFICATION;
    return null;
};
