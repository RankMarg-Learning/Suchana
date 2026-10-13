export interface HomePageSectionRule {
    id: string;
    name: string;
    url?: string;
    headerPatterns: string[];
    stageHint: string;
    statusHint: string;
    priority: number;
}

export interface HomePageRuleConfig {
    url: string;
    sections: HomePageSectionRule[];
    linkFilters: {
        includeSlugRegex: string;
        excludeSlugList?: string[];
        excludeUrlPatterns: string[];
    };
}

export interface CleaningRuleConfig {
    noiseSelectors: string[];
    brandKeywordsToRemove: string[];
    blacklistedLinkDomains: string[];
}

export interface DateFieldRule {
    stage: string;
    isStart?: boolean;
    isMeta?: boolean;
    metaKey?: string;
    patterns: string[];
}

export interface LinkClassificationRule {
    patterns: string[];
    stage?: string;
    actionLabel?: string;
    isNotificationUrl?: boolean;
    isOfficialWebsite?: boolean;
}

export interface TaxonomyCategoryRule {
    pattern: string;
    category: string;
    conductingBody: string;
    state?: string;
    examLevel?: string;
}

export interface StateKeywordRule {
    name: string;
    patterns: string[];
}

export interface SarkariResultRules {
    site: string;
    name: string;
    version: string;
    description: string;
    homePage: HomePageRuleConfig;
    cleaning: CleaningRuleConfig;
    detailExtraction: {
        title: {
            primarySelectors: string[];
            removePatterns: string[];
        };
        dateFields: Record<string, DateFieldRule>;
        relativeDateKeywords: string[];
        linkClassification: Record<string, LinkClassificationRule>;
        taxonomies: {
            categories: TaxonomyCategoryRule[];
            stateKeywords: StateKeywordRule[];
        };
    };
}
