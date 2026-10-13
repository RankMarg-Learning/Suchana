import * as cheerio from 'cheerio';
import { RuleEngineService } from './rules/ruleEngine.service';
import { AiStructuredExam, AiStructuredEvent } from '../deduplication.service';
import { LifecycleStage, STAGE_ORDER_MAP, ExamStatus } from '../../constants/enums';
import { ExamStatusResolver } from './examStatusResolver';
import { AnnualExamResolver } from './annualExamResolver';
import { logger } from '../../utils/logger';

export interface ParsedDateResult {
    startsAt?: Date;
    endsAt?: Date;
    isTBD: boolean;
    rawText: string;
}

export class SarkariResultParser {
    /**
     * Parses the HTML of a sarkariresult detail page into a structured exam payload.
     * ZERO LLM calls — strictly rule-based, deterministic, clean, and safe against takedowns.
     * Supports recurring annual multi-year exam inheritance & authoritative registry matching!
     */
    static async parseDetailPage(html: string, sourceUrl: string, sectionHint?: string): Promise<AiStructuredExam> {
        const rules = RuleEngineService.getRules();
        const $ = cheerio.load(html);

        // 1. Remove noise elements
        rules.cleaning.noiseSelectors.forEach((selector) => $(selector).remove());

        // 2. Extract Slug and Exam Year
        const slug = this.extractSlugFromUrl(sourceUrl);
        const examYear = this.extractYear(slug) || new Date().getFullYear();

        // 3. Extract Raw Title
        let rawTitle = '';
        for (const selector of rules.detailExtraction.title.primarySelectors) {
            const found = $(selector).first().text().replace(/\s+/g, ' ').trim();
            if (found && found.length > 5) {
                rawTitle = found;
                break;
            }
        }
        if (!rawTitle) rawTitle = $('title').text().replace(/\s+/g, ' ').trim();

        // Clean title
        const cleanTitle = this.cleanBrandedText(rawTitle, rules.cleaning.brandKeywordsToRemove);
        const shortTitle = this.generateShortTitle(cleanTitle, slug, examYear);

        // 4. Extract Real Page Intro Overview Paragraph (P2)
        const introParagraph = this.extractIntroParagraph($, rules.cleaning.brandKeywordsToRemove);

        // 5. Authoritatively Resolve Conducting Body, Category, Exam Level, State & Official Website
        // TIER 1: Prior annual editions in database
        // TIER 2: Master Authority Registry (60+ Central & State boards)
        // TIER 3: Direct page DOM organization extraction
        const authority = await AnnualExamResolver.resolveAuthority(slug, cleanTitle, introParagraph);

        // 6. Extract Important Dates
        const rawDates = this.extractDatesSection($);
        const parsedDates = this.mapDateFields(rawDates, rules);

        // 7. Extract Important Links
        const safeLinks = this.extractAndFilterLinks($, rules.cleaning.blacklistedLinkDomains, rules.cleaning.brandKeywordsToRemove);

        // 8. Extract Application Fee, Age Limit, Vacancies, Eligibility, Selection Process
        const applicationFee = this.extractApplicationFee($);
        const age = this.extractAgeLimit($);
        const totalVacancies = this.extractVacancies($, cleanTitle);
        const qualificationCriteria = this.extractEligibility($);
        const additionalDetails = this.extractSelectionProcess($);
        const faqs = this.extractFaqs($, rules.cleaning.brandKeywordsToRemove);

        // 9. Extract Official Links
        const officialLinks = this.classifyOfficialLinks(safeLinks, rules);

        // 10. Build Lifecycle Events
        const events = this.buildLifecycleEvents(parsedDates, officialLinks, shortTitle, sectionHint);

        // 11. Derive Exam Status
        const derivedStatus = this.deriveExamStatus(events, sectionHint);

        // 12. Generate Clean, Rich, Distinct Markdown Description
        const description = this.generateRichDescription({
            cleanTitle,
            conductingBody: authority.conductingBody,
            introParagraph,
            totalVacancies: totalVacancies || undefined,
            age: age || undefined,
            qualificationCriteria: qualificationCriteria || undefined,
            applicationFee: applicationFee || undefined,
            selectionProcess: additionalDetails || undefined,
        });

        return {
            title: cleanTitle,
            shortTitle,
            description,
            conductingBody: authority.conductingBody,
            category: authority.category,
            status: derivedStatus,
            examLevel: authority.examLevel,
            state: authority.state,
            examYear,
            age: age || undefined,
            totalVacancies: totalVacancies || undefined,
            applicationFee: applicationFee || undefined,
            qualificationCriteria: qualificationCriteria || undefined,
            salary: undefined,
            additionalDetails: additionalDetails || undefined,
            officialWebsite: officialLinks.officialWebsite || authority.officialWebsite || undefined,
            notificationUrl: officialLinks.notificationUrl || undefined,
            aiConfidence: 0.95,
            aiNotes: `Extracted deterministically via JSON rules engine (no LLM). Authority source: ${authority.source}`,
            events,
            sourceUrl,
            scrapedAt: new Date(),
            faqs: faqs.length > 0 ? faqs : undefined,
        };
    }

    /**
     * Extracts canonical slug from URL
     * e.g., "https://sarkariresult.com.cm/rrb-ntpc-graduate-level-06-2026/" -> "rrb-ntpc-graduate-level-06-2026"
     */
    static extractSlugFromUrl(urlStr: string): string {
        try {
            const parsed = new URL(urlStr);
            const pathname = parsed.pathname.replace(/^\/+|\/+$/g, '');
            const parts = pathname.split('/');
            return parts[parts.length - 1] || pathname;
        } catch {
            return urlStr.replace(/^https?:\/\/[^\/]+\/|\/$/g, '');
        }
    }

    private static extractYear(text: string): number | null {
        const match = text.match(/\b(202[4-9]|203[0-5])\b/);
        return match ? parseInt(match[1], 10) : null;
    }

    private static cleanBrandedText(text: string, brandKeywords: string[]): string {
        let result = text;
        for (const kw of brandKeywords) {
            const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            result = result.replace(regex, '');
        }
        return result.replace(/\s+/g, ' ').replace(/^[\s–—:-]+|[\s–—:-]+$/g, '').trim();
    }

    private static generateShortTitle(cleanTitle: string, slug: string, year: number): string {
        // Strip common fluff words
        let base = cleanTitle
            .replace(/\b(?:Recruitment|Online Form|Notification|Bharti|Vacanc(?:y|ies)|Tier-?[I|II]|Result|Admit Card)\b/gi, '')
            .replace(/\(\d+.*?\)/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (!base || base.length < 3) {
            // Fallback from slug
            base = slug.replace(/-\d{4}$/, '').replace(/-/g, ' ');
        }

        // Ensure year is appended once
        if (!base.includes(String(year))) {
            base = `${base} ${year}`;
        }

        return base.trim();
    }

    private static inferTaxonomy(title: string, slug: string, rules: any): { category: string; conductingBody: string; examLevel: string; state?: string } {
        const textToSearch = `${title} ${slug}`.toLowerCase();
        let matchedCategory = 'GOVERNMENT_JOBS';
        let conductingBody = 'Government Examination Board';
        let examLevel = 'NATIONAL';
        let state: string | undefined = undefined;

        for (const catRule of rules.detailExtraction.taxonomies.categories) {
            const regex = new RegExp(catRule.pattern, 'i');
            if (regex.test(textToSearch)) {
                matchedCategory = catRule.category;
                conductingBody = catRule.conductingBody;
                if (catRule.examLevel) examLevel = catRule.examLevel;
                if (catRule.state) state = catRule.state;
                break;
            }
        }

        // Check state keywords if state not assigned
        if (!state) {
            for (const stRule of rules.detailExtraction.taxonomies.stateKeywords) {
                if (stRule.patterns.some((p: string) => textToSearch.includes(p.toLowerCase()))) {
                    state = stRule.name;
                    examLevel = 'STATE';
                    break;
                }
            }
        }

        return { category: matchedCategory, conductingBody, examLevel, state };
    }

    private static extractDatesSection($: cheerio.CheerioAPI): Record<string, string> {
        const datesMap: Record<string, string> = {};

        $('h4, h5, strong, p').each((_, el) => {
            const text = $(el).text().trim();
            if (/Important Dates/i.test(text)) {
                const container = $(el).closest('.gb-container, table, div');
                container.find('p, div, li, tr').each((_, item) => {
                    const line = $(item).text().replace(/\s+/g, ' ').trim();
                    if (line.includes(':') && line.length > 5 && line.length < 150) {
                        const parts = line.split(':');
                        const key = parts[0].trim();
                        const val = parts.slice(1).join(':').trim();
                        if (key && val && !/Important Dates/i.test(key)) {
                            datesMap[key] = val;
                        }
                    }
                });
            }
        });

        return datesMap;
    }

    static parseDateString(rawVal: string): ParsedDateResult {
        if (!rawVal) return { isTBD: true, rawText: '' };
        const cleaned = rawVal.replace(/\s+/g, ' ').trim();

        // Check if relative or TBD
        if (/notify later|notified later|to be (?:announced|notified)|tba|tbd|before exam|available soon|will be update|update soon/i.test(cleaned)) {
            return { isTBD: true, rawText: cleaned };
        }

        // 1. Double full date range: "30 September 2026 to 30 October 2026"
        let m = cleaned.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s*(?:[–-]|to)\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
        if (m) {
            const s = new Date(`${m[1]} ${m[2]} ${m[3]} 00:00:00 UTC`);
            const e = new Date(`${m[4]} ${m[5]} ${m[6]} 23:59:59 UTC`);
            if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
                return { startsAt: s, endsAt: e, isTBD: false, rawText: cleaned };
            }
        }

        // 2. Split month range: "27 April – 30 May 2026"
        m = cleaned.match(/(\d{1,2})\s+([A-Za-z]+)\s*(?:[–-]|to)\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
        if (m) {
            const s = new Date(`${m[1]} ${m[2]} ${m[5]} 00:00:00 UTC`);
            const e = new Date(`${m[3]} ${m[4]} ${m[5]} 23:59:59 UTC`);
            if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
                return { startsAt: s, endsAt: e, isTBD: false, rawText: cleaned };
            }
        }

        // 3. Same month range: "09 – 18 November 2026"
        m = cleaned.match(/(\d{1,2})\s*(?:[–-]|to)\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
        if (m) {
            const s = new Date(`${m[1]} ${m[3]} ${m[4]} 00:00:00 UTC`);
            const e = new Date(`${m[2]} ${m[3]} ${m[4]} 23:59:59 UTC`);
            if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
                return { startsAt: s, endsAt: e, isTBD: false, rawText: cleaned };
            }
        }

        // 4. Single date: "08 October 2026"
        m = cleaned.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
        if (m) {
            const d = new Date(`${m[1]} ${m[2]} ${m[3]} 00:00:00 UTC`);
            if (!isNaN(d.getTime())) {
                return { startsAt: d, isTBD: false, rawText: cleaned };
            }
        }

        // 5. Slash or Dash numeric format: "08/10/2026" or "08-10-2026"
        m = cleaned.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
        if (m) {
            const d = new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')} 00:00:00 UTC`);
            if (!isNaN(d.getTime())) {
                return { startsAt: d, isTBD: false, rawText: cleaned };
            }
        }

        return { isTBD: true, rawText: cleaned };
    }

    private static mapDateFields(rawDates: Record<string, string>, rules: any): Record<string, ParsedDateResult> {
        const parsed: Record<string, ParsedDateResult> = {};

        for (const [key, val] of Object.entries(rawDates)) {
            for (const [fieldKey, fieldDef] of Object.entries(rules.detailExtraction.dateFields as Record<string, any>)) {
                if (fieldDef.patterns.some((p: string) => new RegExp(p, 'i').test(key))) {
                    parsed[fieldKey] = this.parseDateString(val);
                    break;
                }
            }
        }

        return parsed;
    }

    private static extractAndFilterLinks(
        $: cheerio.CheerioAPI,
        blacklistedDomains: string[],
        brandKeywords: string[]
    ): { label: string; text: string; url: string }[] {
        const safeLinks: { label: string; text: string; url: string }[] = [];
        const seenUrls = new Set<string>();

        // Specifically check tables for labeled link rows
        $('table tr').each((_, tr) => {
            const cells = $(tr).find('td, th');
            if (cells.length >= 2) {
                const label = $(cells[0]).text().replace(/\s+/g, ' ').trim();
                if (/Related Posts|Latest Posts|Connect With Us/i.test(label)) return;

                $(cells.slice(1)).find('a').each((_, a) => {
                    const href = $(a).attr('href');
                    if (!href) return;
                    const cleanHref = href.trim();
                    if (!cleanHref.startsWith('http')) return;

                    try {
                        const urlObj = new URL(cleanHref);
                        const hostname = urlObj.hostname.toLowerCase();

                        // Blacklist check
                        if (blacklistedDomains.some((d) => hostname.includes(d))) return;

                        if (seenUrls.has(cleanHref)) return;
                        seenUrls.add(cleanHref);

                        let anchorText = $(a).text().replace(/\s+/g, ' ').trim();
                        anchorText = this.cleanBrandedText(anchorText, brandKeywords);
                        const cleanLabel = this.cleanBrandedText(label, brandKeywords);

                        safeLinks.push({
                            label: cleanLabel || anchorText || 'Official Link',
                            text: anchorText || 'Link',
                            url: cleanHref,
                        });
                    } catch { }
                });
            }
        });

        // Also check any standalone links outside tables (e.g. in p or div)
        $('.gb-container a').each((_, a) => {
            if ($(a).closest('table').length > 0) return;
            const href = $(a).attr('href');
            if (!href || !href.startsWith('http')) return;
            try {
                const urlObj = new URL(href.trim());
                const hostname = urlObj.hostname.toLowerCase();
                if (blacklistedDomains.some((d) => hostname.includes(d))) return;
                if (seenUrls.has(href.trim())) return;
                seenUrls.add(href.trim());

                const anchorText = this.cleanBrandedText($(a).text().replace(/\s+/g, ' ').trim(), brandKeywords);
                const parentText = this.cleanBrandedText($(a).parent().text().replace(/\s+/g, ' ').trim(), brandKeywords);

                safeLinks.push({
                    label: parentText || anchorText || 'Official Link',
                    text: anchorText || 'Link',
                    url: href.trim(),
                });
            } catch { }
        });

        return safeLinks;
    }

    private static extractApplicationFee($: cheerio.CheerioAPI): string {
        let text = '';
        $('h4, h5').each((_, el) => {
            if (/Application Fee/i.test($(el).text())) {
                const container = $(el).closest('.gb-container, table, div');
                const lines: string[] = [];
                container.find('p, li, tr').each((_, item) => {
                    const line = $(item).text().replace(/\s+/g, ' ').trim();
                    if (line && line.length > 3 && !/Application Fee/i.test(line)) {
                        lines.push(`- ${line}`);
                    }
                });
                if (lines.length > 0) text = lines.join('\n');
            }
        });
        return text;
    }

    private static extractAgeLimit($: cheerio.CheerioAPI): string {
        let text = '';
        $('h5, h4').each((_, el) => {
            if (/Age Limits?/i.test($(el).text())) {
                const container = $(el).closest('.gb-container, table, div');
                const lines: string[] = [];
                container.find('p, li, tr').each((_, item) => {
                    const line = $(item).text().replace(/\s+/g, ' ').trim();
                    if (line && line.length > 3 && !/Age Limits?/i.test(line)) {
                        lines.push(`- ${line}`);
                    }
                });
                if (lines.length > 0) text = lines.join('\n');
            }
        });
        return text;
    }

    private static extractVacancies($: cheerio.CheerioAPI, cleanTitle: string): string {
        let vacancies = '';
        $('h5, h4').each((_, el) => {
            if (/Total Post|Total Vacanc/i.test($(el).text())) {
                const container = $(el).closest('.gb-container, div');
                const t = container.text().replace(/\s+/g, ' ').trim();
                const m = t.match(/Total Post\s*([\d,]+(?:\s*Posts?)?)/i);
                if (m) vacancies = m[1].trim();
            }
        });

        // Also check if vacancy table exists
        let tableRows: string[] = [];
        $('table').each((_, tbl) => {
            const firstRow = $(tbl).find('tr').first().text().toLowerCase();
            if (firstRow.includes('post name') && (firstRow.includes('no. of post') || firstRow.includes('vacancy'))) {
                $(tbl).find('tr').slice(1).each((_, tr) => {
                    const cells = $(tr).find('td').map((__, td) => $(td).text().trim()).get();
                    if (cells.length >= 2) {
                        tableRows.push(`- **${cells[0]}**: ${cells[1]} posts`);
                    }
                });
            }
        });

        if (tableRows.length > 0) {
            const totalPrefix = vacancies ? `**Total: ${vacancies}**\n\n` : '';
            return `${totalPrefix}${tableRows.join('\n')}`;
        }

        return vacancies;
    }

    private static extractEligibility($: cheerio.CheerioAPI): string {
        let criteria = '';
        $('table').each((_, tbl) => {
            const firstRow = $(tbl).find('tr').first().text().toLowerCase();
            if (firstRow.includes('eligibility criteria') || firstRow.includes('qualification')) {
                $(tbl).find('tr').slice(1).each((_, tr) => {
                    const cells = $(tr).find('td').map((__, td) => $(td).text().trim()).get();
                    if (cells.length >= 2) {
                        criteria += `- **${cells[0]}**: ${cells[1]}\n`;
                    } else if (cells.length === 1) {
                        criteria += `- ${cells[0]}\n`;
                    }
                });
            }
        });
        return criteria.trim();
    }

    private static extractSelectionProcess($: cheerio.CheerioAPI): string {
        let text = '';
        $('h4, h5, table').each((_, el) => {
            const t = $(el).text();
            if (/Mode Of Selection|Selection Process/i.test(t)) {
                const container = $(el).closest('.gb-container, table, div');
                const lines: string[] = [];
                container.find('p, li, tr').each((_, item) => {
                    const line = $(item).text().replace(/\s+/g, ' ').trim();
                    if (line && line.length > 3 && !/Mode Of Selection|Selection Process/i.test(line)) {
                        lines.push(`- ${line}`);
                    }
                });
                if (lines.length > 0) text = lines.join('\n');
            }
        });
        return text;
    }

    private static extractFaqs($: cheerio.CheerioAPI, brandKeywords: string[]): { question: string; answer: string }[] {
        const faqs: { question: string; answer: string }[] = [];

        $('table, .gb-container').each((_, tbl) => {
            const text = $(tbl).text();
            if (/Important Question|FAQ/i.test(text)) {
                $(tbl).find('tr, p').each((_, item) => {
                    const raw = $(item).text().replace(/\s+/g, ' ').trim();
                    const qm = raw.match(/Question:\s*(.*?)\s*Answer:\s*(.*)/i);
                    if (qm) {
                        const question = this.cleanBrandedText(qm[1].trim(), brandKeywords);
                        const answer = this.cleanBrandedText(qm[2].trim(), brandKeywords);
                        if (question && answer) {
                            faqs.push({ question, answer });
                        }
                    }
                });
            }
        });

        return faqs;
    }

    private static classifyOfficialLinks(
        links: { label: string; text: string; url: string }[],
        rules: any
    ): {
        officialWebsite?: string;
        notificationUrl?: string;
        actionLinks: Record<string, { url: string; label: string }>;
    } {
        let officialWebsite: string | undefined;
        let notificationUrl: string | undefined;
        const actionLinks: Record<string, { url: string; label: string }> = {};

        for (const link of links) {
            const labelLower = `${link.label} ${link.text}`.toLowerCase();

            // Check if matches linkClassification
            for (const [classKey, classDef] of Object.entries(rules.detailExtraction.linkClassification as Record<string, any>)) {
                if (classDef.patterns.some((p: string) => labelLower.includes(p.toLowerCase()))) {
                    if (classDef.isOfficialWebsite && !officialWebsite) {
                        officialWebsite = link.url;
                    }
                    if (classDef.isNotificationUrl && !notificationUrl) {
                        notificationUrl = link.url;
                    }
                    if (classDef.stage && !actionLinks[classDef.stage]) {
                        actionLinks[classDef.stage] = {
                            url: link.url,
                            label: classDef.actionLabel || link.text,
                        };
                    }
                    break;
                }
            }
        }

        // Fallback: if official website not detected, check root domain of notification or first gov link
        if (!officialWebsite) {
            const govLink = links.find((l) => l.url.includes('.gov.in') || l.url.includes('.nic.in'));
            if (govLink) {
                try {
                    const u = new URL(govLink.url);
                    officialWebsite = `${u.protocol}//${u.hostname}/`;
                } catch { }
            }
        }

        return { officialWebsite, notificationUrl, actionLinks };
    }

    private static buildLifecycleEvents(
        dates: Record<string, ParsedDateResult>,
        officialLinks: { actionLinks: Record<string, { url: string; label: string }>; notificationUrl?: string },
        shortTitle: string,
        sectionHint?: string
    ): AiStructuredEvent[] {
        const events: AiStructuredEvent[] = [];

        // 1. Notification Event
        events.push({
            stage: LifecycleStage.NOTIFICATION,
            stageOrder: STAGE_ORDER_MAP.NOTIFICATION,
            title: `Notification Released for ${shortTitle}`,
            description: 'Official recruitment notification and guidelines published.',
            startsAt: dates.registrationStart?.startsAt ?? undefined,
            endsAt: undefined,
            isTBD: !dates.registrationStart?.startsAt,
            actionUrl: officialLinks.notificationUrl,
            actionLabel: officialLinks.notificationUrl ? 'Official Notification' : undefined,
        });

        // 2. Registration Event
        const regStart = dates.registrationStart;
        const regEnd = dates.registrationEnd;
        const feeEnd = dates.feePayment;
        const regAction = officialLinks.actionLinks[LifecycleStage.REGISTRATION];

        let regDesc = 'Online application and fee payment window.';
        if (feeEnd?.startsAt) {
            regDesc += ` Fee payment last date: ${feeEnd.rawText}.`;
        }

        events.push({
            stage: LifecycleStage.REGISTRATION,
            stageOrder: STAGE_ORDER_MAP.REGISTRATION,
            title: `Online Registration for ${shortTitle}`,
            description: regDesc,
            startsAt: regStart?.startsAt ?? undefined,
            endsAt: regEnd?.startsAt ?? regEnd?.endsAt ?? undefined,
            isTBD: !regStart?.startsAt && !regEnd?.startsAt,
            actionUrl: regAction?.url,
            actionLabel: regAction?.label || (regAction?.url ? 'Apply Online' : undefined),
        });

        // 3. Correction Window Event (if mentioned)
        const corr = dates.correctionWindow;
        const corrAction = officialLinks.actionLinks[LifecycleStage.CORRECTION_WINDOW];
        if (corr || corrAction) {
            events.push({
                stage: LifecycleStage.CORRECTION_WINDOW,
                stageOrder: STAGE_ORDER_MAP.CORRECTION_WINDOW,
                title: `Application Correction Window for ${shortTitle}`,
                description: 'Window to edit and correct online application particulars.',
                startsAt: corr?.startsAt ?? undefined,
                endsAt: corr?.endsAt ?? corr?.startsAt ?? undefined,
                isTBD: !corr?.startsAt,
                actionUrl: corrAction?.url,
                actionLabel: corrAction?.label || (corrAction?.url ? 'Correction Form' : undefined),
            });
        }

        // 4. Exam City Event (if mentioned)
        const city = dates.examCity;
        const cityAction = officialLinks.actionLinks[LifecycleStage.EXAM_CITY];
        if (city || cityAction) {
            events.push({
                stage: LifecycleStage.EXAM_CITY,
                stageOrder: STAGE_ORDER_MAP.EXAM_CITY,
                title: `Exam City Intimation Slip for ${shortTitle}`,
                description: city?.rawText || 'Intimation of allotted exam city and shift.',
                startsAt: city?.startsAt ?? undefined,
                endsAt: city?.endsAt ?? undefined,
                isTBD: city ? city.isTBD : true,
                actionUrl: cityAction?.url,
                actionLabel: cityAction?.label || (cityAction?.url ? 'Check Exam City' : undefined),
            });
        }

        // 5. Admit Card Event
        const admit = dates.admitCard;
        const admitAction = officialLinks.actionLinks[LifecycleStage.ADMIT_CARD];
        const isAdmitFromSection = sectionHint === 'ADMIT_CARDS';

        events.push({
            stage: LifecycleStage.ADMIT_CARD,
            stageOrder: STAGE_ORDER_MAP.ADMIT_CARD,
            title: `Admit Card Release for ${shortTitle}`,
            description: admit?.rawText || (isAdmitFromSection ? 'Admit Card released. Download hall ticket.' : 'Admit card will be released before the exam date.'),
            startsAt: admit?.startsAt ?? undefined,
            endsAt: admit?.endsAt ?? undefined,
            isTBD: !admit?.startsAt && !isAdmitFromSection,
            actionUrl: admitAction?.url,
            actionLabel: admitAction?.label || (admitAction?.url ? 'Download Admit Card' : undefined),
        });

        // 6. Exam Event
        const exam = dates.examDate;
        const examAction = officialLinks.actionLinks[LifecycleStage.EXAM];
        events.push({
            stage: LifecycleStage.EXAM,
            stageOrder: STAGE_ORDER_MAP.EXAM,
            title: `Examination for ${shortTitle}`,
            description: exam?.rawText || 'Written Examination / Computer Based Test (CBT).',
            startsAt: exam?.startsAt ?? undefined,
            endsAt: exam?.endsAt ?? exam?.startsAt ?? undefined,
            isTBD: exam ? exam.isTBD : true,
            actionUrl: examAction?.url,
            actionLabel: examAction?.label || (examAction?.url ? 'Exam Schedule' : undefined),
        });

        // 7. Answer Key Event (if mentioned or hinted)
        const answer = dates.answerKey;
        const answerAction = officialLinks.actionLinks[LifecycleStage.ANSWER_KEY];
        const isAnswerFromSection = sectionHint === 'ANSWER_KEY';
        if (answer || answerAction || isAnswerFromSection) {
            events.push({
                stage: LifecycleStage.ANSWER_KEY,
                stageOrder: STAGE_ORDER_MAP.ANSWER_KEY,
                title: `Answer Key for ${shortTitle}`,
                description: answer?.rawText || 'Provisional / Final Answer Key and response sheet.',
                startsAt: answer?.startsAt ?? undefined,
                endsAt: answer?.endsAt ?? undefined,
                isTBD: !answer?.startsAt && !isAnswerFromSection,
                actionUrl: answerAction?.url,
                actionLabel: answerAction?.label || (answerAction?.url ? 'Download Answer Key' : undefined),
            });
        }

        // 8. Result Event
        const result = dates.resultDate;
        const resultAction = officialLinks.actionLinks[LifecycleStage.RESULT];
        const isResultFromSection = sectionHint === 'RESULTS';

        events.push({
            stage: LifecycleStage.RESULT,
            stageOrder: STAGE_ORDER_MAP.RESULT,
            title: `Result Declaration for ${shortTitle}`,
            description: result?.rawText || (isResultFromSection ? 'Result announced. Check merit list / cutoff.' : 'Official result announcement.'),
            startsAt: result?.startsAt ?? undefined,
            endsAt: undefined,
            isTBD: !result?.startsAt && !isResultFromSection,
            actionUrl: resultAction?.url,
            actionLabel: resultAction?.label || (resultAction?.url ? 'Check Result' : undefined),
        });

        return events.sort((a, b) => (a.stageOrder ?? 0) - (b.stageOrder ?? 0));
    }

    private static deriveExamStatus(events: AiStructuredEvent[], sectionHint?: string): string {
        return ExamStatusResolver.resolveStatus(events, new Date(), sectionHint);
    }

    private static extractIntroParagraph($: cheerio.CheerioAPI, brandKeywords: string[]): string {
        let intro = '';
        $('p').each((_, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (
                text.length > 50 &&
                text.length < 1000 &&
                /(?:released|notification|recruitment|invited|conducted|eligibility|vacanc|posts|admit card|result|answer key)/i.test(text) &&
                !/important date|application fee|how to fill|connect with us|telegram|whatsapp|disclaimer|related posts/i.test(text)
            ) {
                if (!intro) {
                    intro = text;
                }
            }
        });
        return this.cleanBrandedText(intro, brandKeywords);
    }

    private static generateRichDescription(params: {
        cleanTitle: string;
        conductingBody: string;
        introParagraph?: string;
        totalVacancies?: string;
        age?: string;
        qualificationCriteria?: string;
        applicationFee?: string;
        selectionProcess?: string;
    }): string {
        const sections: string[] = [];

        // 1. Executive Summary / Overview (Real page intro text)
        if (params.introParagraph && params.introParagraph.length > 40) {
            sections.push(`### Overview\n${params.introParagraph}`);
        } else {
            let summary = `**${params.conductingBody}** has released the official recruitment notification for **${params.cleanTitle}**.`;
            if (params.totalVacancies) {
                summary += ` A total of **${params.totalVacancies}** vacancies are announced under this recruitment drive.`;
            }
            summary += ` Eligible candidates can review the key dates, eligibility requirements, age limit, application fee, and access direct official links below.`;
            sections.push(`### Overview\n${summary}`);
        }

        // 2. Vacancy Details
        if (params.totalVacancies) {
            sections.push(`### Vacancy Details\n${params.totalVacancies}`);
        }

        // 3. Eligibility & Qualifications
        if (params.qualificationCriteria) {
            sections.push(`### Eligibility & Educational Qualifications\n${params.qualificationCriteria}`);
        }

        // 4. Age Limit
        if (params.age) {
            sections.push(`### Age Limit & Criteria\n${params.age}`);
        }

        // 5. Application Fee
        if (params.applicationFee) {
            sections.push(`### Application Fee & Payment Mode\n${params.applicationFee}`);
        }

        // 6. Selection Process
        if (params.selectionProcess) {
            sections.push(`### Selection Process\n${params.selectionProcess}`);
        }

        return sections.join('\n\n');
    }
}
