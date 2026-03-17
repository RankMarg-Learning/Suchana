import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { checkAndStage, AiStructuredExam } from './deduplication.service';
import {
    ScrapeJobStatus,
    EXAM_CATEGORIES,
    EXAM_LEVELS,
    LIFECYCLE_STAGES,
    LIFECYCLE_EVENT_TYPES,
} from '../constants/enums';
import { env } from '../config/env';
import { getSiteConfig, SiteConfig } from '../config/scraperConfig';

// ─── Interfaces ──────────────────────────────────────────────

export interface ScrapeSourceConfig {
    id: string;
    url: string;
    label: string;
    sourceType: string;
    hintCategory?: string | null;
    selectorHints?: Record<string, unknown> | null;
}

export interface ScrapeResult {
    jobId: string;
    status: string;
    candidatesFound: number;
    results: DeduplicationSummary[];
    errors: string[];
}

export interface DeduplicationSummary {
    sourceUrl: string;
    outcome: string;
    stagedExamId?: string;
    existingExamId?: string;
    canonicalStagedExamId?: string;
    reason?: string;
}

// ─── AI Provider ─────────────────────────────────────────────

class AIProvider {
    private static instance: OpenAI | null = null;
    private static readonly CURRENT_YEAR = new Date().getFullYear();

    private static getClient(): OpenAI {
        if (!this.instance) {
            const apiKey = (env as unknown as Record<string, string>)['OPENAI_API_KEY'];
            if (!apiKey) throw new Error('OPENAI_API_KEY is not set in environment');
            this.instance = new OpenAI({ apiKey });
        }
        return this.instance;
    }

    static async extractExamData(plaintext: string, url: string, hintCategory?: string): Promise<AiStructuredExam | null> {
        const prompt = this.buildPrompt(plaintext, url, hintCategory);
        const openai = this.getClient();

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0,
                max_tokens: 2000,
                response_format: { type: 'json_object' },
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) return null;

            return JSON.parse(content) as AiStructuredExam;
        } catch (err) {
            logger.error('[AI] Extraction failed', { url, err });
            return null;
        }
    }

    private static buildPrompt(text: string, sourceUrl: string, hintCategory?: string): string {
        return `You are an expert Indian government exam data extractor. 
Extract structured exam data from the text below.

SOURCE URL: ${sourceUrl}
HINT CATEGORY: ${hintCategory ?? 'auto-detect'}
CURRENT YEAR: ${this.CURRENT_YEAR}

RULES:
1. Dates: ISO8601 format (YYYY-MM-DDTHH:mm:ss.000Z). Infer year from context using ${this.CURRENT_YEAR}.
2. isTBD: true ONLY if date is explicitly "To be announced".
3. isImportant: true for APPLICATION_START, APPLICATION_END, EXAM_DATE, RESULT.
4. Allowed Enum Values:
   - category: ${EXAM_CATEGORIES.join(', ')}
   - examLevel: ${EXAM_LEVELS.join(', ')}
   - stage: ${LIFECYCLE_STAGES.join(', ')}
   - eventType: ${LIFECYCLE_EVENT_TYPES.join(', ')}
5. Data types:
   - aiConfidence: float 0.0–1.0.
   - applicationFee: JSON map of categories to amounts (e.g. {"general": 500}).
   - qualificationCriteria: JSON map (e.g. {"minQualification": "GRADUATE"}).
   - totalVacancies: JSON map of posts to counts (e.g. {"Assistant": 100}).
6. Official links only. No third-party ads/spam links.

STAGE ORDER GUIDELINE:
NOTIFICATION=10, REGISTRATION=20, ADMIT_CARD=30, EXAM=40, ANSWER_KEY=50, RESULT=60, DV=70, JOINING=80

TEXT:
---
${text}
---

Return JSON:
{
  "title": "string",
  "shortTitle": "string",
  "description": "markdown",
  "conductingBody": "string",
  "category": "ENUM",
  "examLevel": "NATIONAL|STATE|DISTRICT",
  "state": "string|null",
  "examYear": number,
  "minAge": number,
  "maxAge": number,
  "totalVacancies": {},
  "applicationFee": {},
  "qualificationCriteria": {},
  "officialWebsite": "url",
  "notificationUrl": "url",
  "aiConfidence": number,
  "aiNotes": "string",
  "events": [
    {
      "stage": "ENUM",
      "eventType": "ENUM",
      "stageOrder": number,
      "title": "string",
      "description": "markdown",
      "startsAt": "ISO",
      "endsAt": "ISO",
      "isTBD": boolean,
      "isImportant": boolean,
      "actionUrl": "url",
      "actionLabel": "string"
    }
  ]
}`;
    }
}

// ─── Scraper Utilities ───────────────────────────────────────

class ScraperUtils {
    static async fetchHtml(url: string): Promise<string> {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            },
            signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.text();
    }

    static cleanHtml(html: string, url: string): { text: string; charCount: number } {
        const config = getSiteConfig(url);
        const $ = cheerio.load(html);

        // Remove noise
        config.noiseSelectors.forEach(sel => $(sel).remove());
        $('script, style, noscript, iframe, .ad, .advertisement').remove();

        let contentText = '';
        for (const selector of config.contentSelectors) {
            const el = $(selector);
            if (el.length) {
                contentText = el.map((_, e) => $(e).text()).get().join('\n');
                if (contentText.trim().length > 300) break;
            }
        }

        if (!contentText.trim()) contentText = $('body').text();

        const cleaned = this.decodeEntities(contentText)
            .replace(/\t/g, ' ')
            .replace(/ {2,}/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        return {
            text: cleaned.slice(0, 5000), // Increased limit slightly for better AI context
            charCount: cleaned.length
        };
    }

    static extractLinks(html: string, baseUrl: string): string[] {
        const config = getSiteConfig(baseUrl);
        const $ = cheerio.load(html);
        const links = new Set<string>();

        $(config.listingLinkSelector).each((_, el) => {
            const href = $(el).attr('href');
            if (!href) return;
            try {
                const absolute = new URL(href, baseUrl).toString();
                if (config.listingLinkFilter(absolute)) {
                    links.add(absolute);
                }
            } catch { }
        });

        return Array.from(links);
    }

    private static decodeEntities(text: string): string {
        const entities: Record<string, string> = {
            '&amp;': '&', '&nbsp;': ' ', '&lt;': '<', '&gt;': '>',
            '&quot;': '"', '&#39;': "'", '&ndash;': '–', '&mdash;': '—',
            '&rsquo;': "'", '&lsquo;': "'", '&rdquo;': '"', '&ldquo;': '"'
        };
        return text.replace(/&[a-z0-9#]+;/gi, (match) => entities[match] || match);
    }
}

// ─── Scraper Service ─────────────────────────────────────────

export class ScraperService {
    /**
     * Scrapes a single detail page and processes deduplication/staging
     */
    static async scrapePage(jobId: string, url: string, hintCategory?: string): Promise<DeduplicationSummary> {
        try {
            logger.info(`[Scraper] Processing: ${url}`);
            const html = await ScraperUtils.fetchHtml(url);
            const { text, charCount } = ScraperUtils.cleanHtml(html, url);

            const extracted = await AIProvider.extractExamData(text, url, hintCategory);
            if (!extracted) {
                return { sourceUrl: url, outcome: 'AI_FAILED', reason: 'AI failed to parse content' };
            }

            // Enrich with metadata
            extracted.sourceUrl = url;
            extracted.scrapedAt = new Date();

            const dedup = await checkAndStage(jobId, extracted);

            return {
                sourceUrl: url,
                outcome: dedup.outcome,
                stagedExamId: 'stagedExamId' in dedup ? dedup.stagedExamId : undefined,
                existingExamId: 'existingExamId' in dedup ? dedup.existingExamId : undefined,
                canonicalStagedExamId: 'canonicalStagedExamId' in dedup ? dedup.canonicalStagedExamId : undefined,
                reason: 'reason' in dedup ? dedup.reason : undefined,
            };
        } catch (err: any) {
            logger.error(`[Scraper] Failed ${url}: ${err.message}`);
            return { sourceUrl: url, outcome: 'ERROR', reason: err.message };
        }
    }

    /**
     * Primary entry point for a scraping job
     */
    static async runJob(source: ScrapeSourceConfig): Promise<ScrapeResult> {
        const job = await prisma.scrapeJob.create({
            data: { scrapeSourceId: source.id, status: ScrapeJobStatus.RUNNING }
        });

        const results: DeduplicationSummary[] = [];
        const errors: string[] = [];
        const logData: any = { sourceUrl: source.url, mode: source.sourceType };

        try {
            let targets: string[] = [];

            if (source.sourceType === 'LISTING') {
                const listHtml = await ScraperUtils.fetchHtml(source.url);
                targets = ScraperUtils.extractLinks(listHtml, source.url);
                logData.linksFound = targets.length;
                logger.info(`[Scraper] Found ${targets.length} links on listing page`);
            } else {
                targets = [source.url];
            }

            for (const url of targets) {
                const summary = await ScraperService.scrapePage(job.id, url, source.hintCategory ?? undefined);
                results.push(summary);
                if (summary.outcome === 'ERROR') errors.push(`${url}: ${summary.reason}`);

                // Throttle to be polite and avoid rate limits
                await new Promise(r => setTimeout(r, 1000));
            }

            const candidatesFound = results.filter(r => ['NEW_STAGED', 'LINKED_AS_UPDATE'].includes(r.outcome)).length;

            const finalStatus = errors.length === 0
                ? ScrapeJobStatus.COMPLETED
                : errors.length < targets.length ? ScrapeJobStatus.PARTIAL : ScrapeJobStatus.FAILED;

            await prisma.scrapeJob.update({
                where: { id: job.id },
                data: {
                    status: finalStatus,
                    candidatesFound,
                    completedAt: new Date(),
                    rawPayload: { ...logData, results: results.slice(0, 50) } as any
                }
            });

            return { jobId: job.id, status: finalStatus, candidatesFound, results, errors };
        } catch (err: any) {
            await prisma.scrapeJob.update({
                where: { id: job.id },
                data: { status: ScrapeJobStatus.FAILED, errorMessage: err.message, completedAt: new Date() }
            });
            return { jobId: job.id, status: ScrapeJobStatus.FAILED, candidatesFound: 0, results, errors: [err.message] };
        }
    }
}

// ─── Legacy Exports for Backward Compatibility ───────────────

export const runScrapeJob = ScraperService.runJob.bind(ScraperService);
