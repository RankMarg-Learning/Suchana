export interface ScrapeSourceConfig {
    id: string;
    url: string;
    label: string;
    sourceType: string;
    hintCategory?: string | null;
    selectorHints?: Record<string, unknown> | null;
}

export interface DeduplicationSummary {
    sourceUrl: string;
    outcome: string;
    stagedExamId?: string;
    existingExamId?: string;
    canonicalStagedExamId?: string;
    reason?: string;
}

export interface ScrapeResult {
    jobId: string;
    status: string;
    candidatesFound: number;
    results: DeduplicationSummary[];
    errors: string[];
}
