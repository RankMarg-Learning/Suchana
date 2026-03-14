// ============================================================
// src/services/scraper.service.ts
// Core scraper: fetch → clean → AI-extract → deduplicate
// ============================================================
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import OpenAI from 'openai';
import slugifyPkg from 'slugify';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { checkAndStage, AiStructuredExam } from './deduplication.service';
import {
    ExamCategory,
    ExamLevel,
    LifecycleStage,
    LifecycleEventType,
    ScrapeJobStatus,
    EXAM_CATEGORIES,
    EXAM_LEVELS,
    LIFECYCLE_STAGES,
    LIFECYCLE_EVENT_TYPES,
} from '../constants/enums';
import { env } from '../config/env';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// OpenAI client (lazy – only instantiated when needed)
// ─────────────────────────────────────────────────────────────
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
    if (!_openai) {
        const apiKey = (env as unknown as Record<string, string>)['OPENAI_API_KEY'];
        if (!apiKey) throw new Error('OPENAI_API_KEY is not set in environment');
        _openai = new OpenAI({ apiKey });
    }
    return _openai;
}

// ─────────────────────────────────────────────────────────────
// Site-specific config (detected by hostname)
// ─────────────────────────────────────────────────────────────
interface SiteConfig {
    noiseSelectors: string[];
    contentSelectors: string[];
    listingLinkSelector: string;
    listingLinkFilter: (href: string) => boolean;
}

const SITE_CONFIGS: Record<string, SiteConfig> = {
    'freejobalert.com': {
        noiseSelectors: [
            'header', 'footer', 'nav', '.widget', '.sidebar', '#sidebar',
            '.advertisement', '.ad', '#ad', 'script', 'style', 'noscript',
            '.comment', '#comments', '.social-share', '.related-posts',
        ],
        contentSelectors: ['article', '.entry-content', 'main', 'table', '.post-content'],
        listingLinkSelector: 'h2 a, .entry-title a, h3 a',
        listingLinkFilter: (href) => href.includes('freejobalert.com/') && !href.endsWith('freejobalert.com/'),
    },
    'sarkariresult.com': {
        noiseSelectors: [
            'header', 'footer', 'nav', '.widget', '.sidebar', 'script', 'style',
            'noscript', '#comments', '.social', '.ad', '.advertisement',
        ],
        contentSelectors: ['.content', '#content', 'main', 'article', 'table', '.post-content'],
        listingLinkSelector: 'table a, .content a, h2 a',
        listingLinkFilter: (href) => href.includes('sarkariresult.com/') && href.length > 30,
    },
    'sarkarinaukri.com': {
        noiseSelectors: [
            'header', 'footer', 'nav', '.sidebar', '.widget', 'script', 'style',
            'noscript', '.advertisement', '.ad', '#comments',
        ],
        contentSelectors: ['main', 'article', '.entry-content', '#content', 'table'],
        listingLinkSelector: 'h2 a, h3 a, .post-title a, article a',
        listingLinkFilter: (href) => href.includes('sarkarinaukri.com/') && href.length > 30,
    },
};

function getSiteConfig(url: string): SiteConfig {
    try {
        const hostname = new URL(url).hostname.replace(/^www\./, '');
        if (SITE_CONFIGS[hostname]) return SITE_CONFIGS[hostname];
    } catch {}
    // Default generic config
    return {
        noiseSelectors: ['header', 'footer', 'nav', '.sidebar', 'script', 'style', 'noscript', '.ad'],
        contentSelectors: ['main', 'article', '.content', '#content', '.post-content', 'table'],
        listingLinkSelector: 'h2 a, h3 a, article a',
        listingLinkFilter: (_href) => true,
    };
}

// ─────────────────────────────────────────────────────────────
// HTML fetch
// ─────────────────────────────────────────────────────────────
async function fetchHtml(url: string): Promise<string> {
    const res = await fetch(url, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.text();
}

// ─────────────────────────────────────────────────────────────
// HTML cleaning: strip noise → extract content → decode → collapse
// ─────────────────────────────────────────────────────────────
function decodeEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&ndash;/g, '–')
        .replace(/&mdash;/g, '—')
        .replace(/&rsquo;/g, "'")
        .replace(/&lsquo;/g, "'")
        .replace(/&rdquo;/g, '"')
        .replace(/&ldquo;/g, '"');
}

export function cleanHtml(html: string, url: string): { text: string; rawCharCount: number } {
    const siteConfig = getSiteConfig(url);
    const $ = cheerio.load(html);

    // Strip noise selectors
    siteConfig.noiseSelectors.forEach((sel) => $(sel).remove());

    // Try to extract content from priority selectors
    let contentText = '';
    for (const selector of siteConfig.contentSelectors) {
        const el = $(selector);
        if (el.length) {
            contentText = el.map((_, e) => $(e).text()).get().join('\n');
            if (contentText.trim().length > 200) break;
        }
    }

    // Fallback: use body text
    if (!contentText.trim()) {
        contentText = $('body').text();
    }

    // Decode HTML entities
    contentText = decodeEntities(contentText);

    // Collapse whitespace
    contentText = contentText
        .replace(/\t/g, ' ')
        .replace(/ {2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    const rawCharCount = contentText.length;
    logger.info(`[Scraper] Cleaned text length before truncation: ${rawCharCount} chars for URL: ${url}`);

    // HARD TRUNCATE to 3000 chars
    const truncated = contentText.slice(0, 3000);

    return { text: truncated, rawCharCount };
}

// ─────────────────────────────────────────────────────────────
// Extract listing links from a LISTING page
// ─────────────────────────────────────────────────────────────
export function extractListingLinks(html: string, baseUrl: string): string[] {
    const siteConfig = getSiteConfig(baseUrl);
    const $ = cheerio.load(html);
    const links: string[] = [];
    const seen = new Set<string>();

    $(siteConfig.listingLinkSelector).each((_, el) => {
        const href = $(el).attr('href') ?? '';
        const abs = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
        if (!seen.has(abs) && siteConfig.listingLinkFilter(abs)) {
            seen.add(abs);
            links.push(abs);
        }
    });

    return links;
}

// ─────────────────────────────────────────────────────────────
// AI extraction prompt
// ─────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();

function buildExtractionPrompt(cleanedText: string, sourceUrl: string, hintCategory?: string): string {
    return `You are an expert Indian government exam data extractor. Extract structured exam data from the text below.

SOURCE URL: ${sourceUrl}
HINT CATEGORY: ${hintCategory ?? 'auto-detect'}
CURRENT YEAR: ${CURRENT_YEAR}

RULES:
- All dates MUST be ISO8601 format (YYYY-MM-DDTHH:mm:ss.000Z). If year is missing, infer from context using ${CURRENT_YEAR}.
- isTBD: true ONLY when date is explicitly "To be announced" or similar. Default false.
- isImportant: true ONLY for APPLICATION_START, APPLICATION_END, EXAM_DATE, RESULT events.
- category MUST be one of: ${EXAM_CATEGORIES.join(', ')}
- examLevel MUST be one of: ${EXAM_LEVELS.join(', ')}
- stage MUST be one of: ${LIFECYCLE_STAGES.join(', ')}
- eventType MUST be one of: ${LIFECYCLE_EVENT_TYPES.join(', ')}
- aiConfidence: float 0.0–1.0 indicating your confidence in the extracted data.
- description fields can use markdown for structure (bullet points, bold for key dates, etc.)
- If totalVacancies is unknown, omit it (don't set to null).
- conductingBody: the official organization name (e.g., "UPSC", "SSC", "Railway Recruitment Board").
- For applicationFee, use JSON: {"general": 500, "obc": 300, "sc_st": 0, "female": 0, "currency": "INR"}
- For qualificationCriteria, use JSON: {"minQualification": "GRADUATE", "degree": "B.Tech", "specialization": "Any", "notes": "..."}

STAGE ORDER MAP (use these stageOrder values):
NOTIFICATION=10, REGISTRATION=20, ADMIT_CARD=30, EXAM=40, ANSWER_KEY=50, RESULT=60, DOCUMENT_VERIFICATION=70, JOINING=80

TEXT TO EXTRACT FROM:
---
${cleanedText}
---

Return ONLY valid JSON matching this schema (no markdown, no extra text):
{
  "title": "Full exam title",
  "shortTitle": "Short acronym/name",
  "description": "Markdown description with key facts",
  "conductingBody": "Organization name",
  "category": "ENUM_VALUE",
  "examLevel": "NATIONAL|STATE|DISTRICT",
  "state": "State name if STATE level, else null",
  "examYear": ${CURRENT_YEAR},
  "minAge": 18,
  "maxAge": 30,
  "totalVacancies": 1000,
  "applicationFee": {"general": 500, "sc_st": 0, "currency": "INR"},
  "qualificationCriteria": {"minQualification": "GRADUATE"},
  "officialWebsite": "https://...",
  "notificationUrl": "https://...",
  "aiConfidence": 0.85,
  "aiNotes": "Any caveats or missing info",
  "events": [
    {
      "stage": "REGISTRATION",
      "eventType": "START",
      "stageOrder": 20,
      "title": "Registration Opens",
      "description": "Online application at official portal",
      "startsAt": "2026-03-01T00:00:00.000Z",
      "endsAt": "2026-03-31T23:59:59.000Z",
      "isTBD": false,
      "isImportant": true,
      "actionUrl": "https://...",
      "actionLabel": "Apply Now"
    }
  ]
}`;
}

// ─────────────────────────────────────────────────────────────
// Call GPT-4o-mini
// ─────────────────────────────────────────────────────────────
async function callAI(prompt: string): Promise<AiStructuredExam | null> {
    const openai = getOpenAI();
    
    const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    try {
        const parsed = JSON.parse(content);
        return parsed as AiStructuredExam;
    } catch (err) {
        logger.error('[Scraper] Failed to parse AI JSON response', { err, content });
        return null;
    }
}

// ─────────────────────────────────────────────────────────────
// Content hash for debugging (using built-in crypto)
// ─────────────────────────────────────────────────────────────
function contentHash(title: string, conductingBody: string, totalVacancies?: number): string {
    const raw = `${title}|${conductingBody}|${totalVacancies ?? ''}`;
    return createHash('sha256').update(raw).digest('hex');
}

// ─────────────────────────────────────────────────────────────
// deduplicationKey = slugify(`${conductingBody}-${category}-${year}`)
// ─────────────────────────────────────────────────────────────
function buildDeduplicationKey(conductingBody: string, category: string, year: number): string {
    const raw = `${conductingBody}-${category}-${year}`;
    return (slugifyPkg as unknown as (text: string, opts?: unknown) => string)(raw, {
        lower: true,
        strict: true,
        replacement: '-',
    });
}

// ─────────────────────────────────────────────────────────────
// Scrape a single DETAIL page, extract, deduplicate
// ─────────────────────────────────────────────────────────────
async function scrapeDetailPage(
    jobId: string,
    url: string,
    hintCategory?: string,
): Promise<DeduplicationSummary> {
    try {
        const html = await fetchHtml(url);
        const { text: cleanedText, rawCharCount } = cleanHtml(html, url);

        const prompt = buildExtractionPrompt(cleanedText, url, hintCategory);
        const extracted = await callAI(prompt);

        if (!extracted) {
            return { sourceUrl: url, outcome: 'AI_FAILED', reason: 'AI returned no parseable JSON' };
        }

        // Attach source metadata
        extracted.sourceUrl = url;
        extracted.scrapedAt = new Date();

        // Log rawCharCount in job payload (done in caller via job update)
        logger.info(`[Scraper] AI extracted: "${extracted.title}" confidence=${extracted.aiConfidence} charsBefore=${rawCharCount}`);

        // Run deduplication
        const dedupResult = await checkAndStage(jobId, extracted);

        const summary: DeduplicationSummary = {
            sourceUrl: url,
            outcome: dedupResult.outcome,
        };

        if (dedupResult.outcome === 'NEW_STAGED') {
            summary.stagedExamId = dedupResult.stagedExamId;
        } else if (dedupResult.outcome === 'LINKED_AS_UPDATE') {
            summary.stagedExamId = dedupResult.stagedExamId;
            summary.existingExamId = dedupResult.existingExamId;
        } else if (dedupResult.outcome === 'MERGED_INTO_CANONICAL') {
            summary.canonicalStagedExamId = dedupResult.canonicalStagedExamId;
        } else if (dedupResult.outcome === 'EXACT_DUPLICATE') {
            summary.reason = dedupResult.reason;
        }

        return summary;
    } catch (err: any) {
        logger.error(`[Scraper] Error scraping ${url}: ${err.message}`);
        return { sourceUrl: url, outcome: 'ERROR', reason: err.message };
    }
}

// ─────────────────────────────────────────────────────────────
// Main scrape orchestrator
// ─────────────────────────────────────────────────────────────
export async function runScrapeJob(source: ScrapeSourceConfig): Promise<ScrapeResult> {
    // Create job record
    const job = await prisma.scrapeJob.create({
        data: {
            scrapeSourceId: source.id,
            status: ScrapeJobStatus.RUNNING,
        },
    });

    const jobId = job.id;
    const results: DeduplicationSummary[] = [];
    const errors: string[] = [];
    const rawPayloadLog: Record<string, unknown> = {};

    try {
        let detailUrls: string[] = [];

        if (source.sourceType === 'LISTING') {
            logger.info(`[Scraper] LISTING mode: fetching ${source.url}`);
            const listHtml = await fetchHtml(source.url);
            detailUrls = extractListingLinks(listHtml, source.url);
            logger.info(`[Scraper] Found ${detailUrls.length} detail URLs from listing`);
            rawPayloadLog['listingUrl'] = source.url;
            rawPayloadLog['detailUrlsFound'] = detailUrls.length;
            rawPayloadLog['detailUrls'] = detailUrls.slice(0, 20); // cap log size
        } else {
            // DETAIL mode: single URL
            detailUrls = [source.url];
        }

        // Process detail pages sequentially to be respectful
        for (const url of detailUrls) {
            const summary = await scrapeDetailPage(jobId, url, source.hintCategory ?? undefined);
            results.push(summary);

            if (summary.outcome === 'ERROR') {
                errors.push(`${url}: ${summary.reason}`);
            }

            // Small delay between requests
            await new Promise((r) => setTimeout(r, 800));
        }

        const candidatesFound = results.filter(
            (r) => r.outcome === 'NEW_STAGED' || r.outcome === 'LINKED_AS_UPDATE',
        ).length;

        rawPayloadLog['resultsBreakdown'] = results.reduce<Record<string, number>>((acc, r) => {
            acc[r.outcome] = (acc[r.outcome] ?? 0) + 1;
            return acc;
        }, {});

        const finalStatus =
            errors.length === 0
                ? ScrapeJobStatus.COMPLETED
                : errors.length < results.length
                ? ScrapeJobStatus.PARTIAL
                : ScrapeJobStatus.FAILED;

        await prisma.scrapeJob.update({
            where: { id: jobId },
            data: {
                status: finalStatus,
                candidatesFound,
                completedAt: new Date(),
                rawPayload: rawPayloadLog as never,
            },
        });

        logger.info(`[Scraper] Job ${jobId} completed. Status=${finalStatus} candidates=${candidatesFound}`);

        return { jobId, status: finalStatus, candidatesFound, results, errors };
    } catch (err: any) {
        logger.error(`[Scraper] Job ${jobId} FAILED: ${err.message}`);
        await prisma.scrapeJob.update({
            where: { id: jobId },
            data: {
                status: ScrapeJobStatus.FAILED,
                completedAt: new Date(),
                errorMessage: err.message,
            },
        });
        return { jobId, status: ScrapeJobStatus.FAILED, candidatesFound: 0, results, errors: [err.message] };
    }
}

// ─────────────────────────────────────────────────────────────
// Promote a StagedExam → Exam table (admin approval)
// All field mapping from StagedExam schema → Exam schema happens here.
// ─────────────────────────────────────────────────────────────
export async function promoteStagedExam(stagedExamId: string, adminId: string): Promise<{ examId: string }> {
    // Re-fetch fresh from DB (review.service may have just updated title/corrections)
    const staged = await prisma.stagedExam.findUnique({
        where: { id: stagedExamId },
        include: { stagedEvents: { orderBy: { stageOrder: 'asc' } } },
    });

    if (!staged) throw new Error(`StagedExam ${stagedExamId} not found`);
    if (staged.reviewStatus !== 'APPROVED') throw new Error(`StagedExam ${stagedExamId} is not APPROVED`);

    // ── Build safe slug ──────────────────────────────────────
    async function buildUniqueSlug(base: string): Promise<string> {
        const slug = base
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 100);

        let candidate = slug;
        let counter = 1;
        while (await prisma.exam.findUnique({ where: { slug: candidate } })) {
            candidate = `${slug}-${counter++}`;
        }
        return candidate;
    }

    // ── Map staged → Exam fields ─────────────────────────────
    // totalVacancies in Exam is Json?  — store as { count: N } for structured access
    const totalVacanciesJson = staged.totalVacancies != null
        ? { count: staged.totalVacancies }
        : undefined;

    // Safe deduplicationKey — null it if it would collide
    let deduplicationKey: string | undefined = staged.deduplicationKey ?? undefined;
    if (deduplicationKey) {
        const clash = await prisma.exam.findUnique({ where: { deduplicationKey } });
        if (clash && clash.id !== staged.existingExamId) {
            // Append staged exam id suffix to avoid unique constraint failure
            deduplicationKey = `${deduplicationKey}-${stagedExamId.slice(-6)}`;
        }
    }

    // ── Event rows builder ───────────────────────────────────
    const eventRows = staged.stagedEvents.map((ev) => ({
        stage: ev.stage,
        eventType: ev.eventType,
        stageOrder: ev.stageOrder,
        title: ev.title,
        description: ev.description ?? undefined,
        startsAt: ev.startsAt ?? undefined,
        endsAt: ev.endsAt ?? undefined,
        isTBD: ev.isTBD,
        isImportant: ev.isImportant,
        actionUrl: ev.actionUrl ?? undefined,
        actionLabel: ev.actionLabel ?? undefined,
        sourceStagedEventId: ev.id,
        createdBy: adminId,
    }));

    // ── UPDATE existing exam ─────────────────────────────────
    if (staged.existingExamId) {
        const existing = await prisma.exam.findUnique({ where: { id: staged.existingExamId } });
        if (!existing) throw new Error(`Linked exam ${staged.existingExamId} no longer exists`);

        await prisma.$transaction(async (tx) => {
            await tx.exam.update({
                where: { id: staged.existingExamId! },
                data: {
                    title: staged.title,
                    shortTitle: staged.shortTitle ?? staged.title,
                    description: staged.description ?? existing.description,
                    conductingBody: staged.conductingBody ?? existing.conductingBody,
                    category: staged.category ?? existing.category,
                    examLevel: staged.examLevel ?? existing.examLevel,
                    state: staged.state ?? existing.state,
                    minAge: staged.minAge ?? existing.minAge,
                    maxAge: staged.maxAge ?? existing.maxAge,
                    qualificationCriteria: (staged.qualificationCriteria ?? existing.qualificationCriteria) as never,
                    totalVacancies: (totalVacanciesJson ?? existing.totalVacancies) as never,
                    applicationFee: (staged.applicationFee ?? existing.applicationFee) as never,
                    officialWebsite: staged.officialWebsite ?? existing.officialWebsite,
                    notificationUrl: staged.notificationUrl ?? existing.notificationUrl,
                    sourceStagedExamId: staged.id,
                    status: 'ACTIVE',
                    isPublished: true,
                    publishedAt: existing.publishedAt ?? new Date(),
                    updatedAt: new Date(),
                },
            });

            // Replace all lifecycle events with the scraped ones
            await tx.lifecycleEvent.deleteMany({ where: { examId: staged.existingExamId! } });

            if (eventRows.length > 0) {
                await tx.lifecycleEvent.createMany({ data: eventRows.map(r => ({ ...r, examId: staged.existingExamId! })) });
            }

            // Mark staged exam as promoted
            await tx.stagedExam.update({
                where: { id: stagedExamId },
                data: { existingExamId: staged.existingExamId },
            });
        });

        logger.info(`[Promote] Updated existing Exam ${staged.existingExamId} from StagedExam ${stagedExamId}`);
        return { examId: staged.existingExamId };
    }

    // ── CREATE new exam ──────────────────────────────────────
    const baseSlug = staged.slug ?? staged.title;
    const finalSlug = await buildUniqueSlug(baseSlug);

    const { examId } = await prisma.$transaction(async (tx) => {
        const exam = await tx.exam.create({
            data: {
                title: staged.title,
                shortTitle: staged.shortTitle ?? staged.title,
                slug: finalSlug,
                description: staged.description ?? undefined,
                conductingBody: staged.conductingBody ?? 'Unknown',
                category: staged.category ?? 'OTHER',
                examLevel: staged.examLevel ?? 'NATIONAL',
                state: staged.state ?? undefined,
                minAge: staged.minAge ?? undefined,
                maxAge: staged.maxAge ?? undefined,
                qualificationCriteria: staged.qualificationCriteria as never ?? undefined,
                totalVacancies: totalVacanciesJson as never ?? undefined,
                applicationFee: staged.applicationFee as never ?? undefined,
                officialWebsite: staged.officialWebsite ?? undefined,
                notificationUrl: staged.notificationUrl ?? undefined,
                deduplicationKey: deduplicationKey ?? undefined,
                sourceStagedExamId: staged.id,
                createdBy: adminId,
                // Auto-publish on approval so it immediately appears in live feed
                status: 'ACTIVE',
                isPublished: true,
                publishedAt: new Date(),
                lifecycleEvents: eventRows.length > 0 ? { create: eventRows } : undefined,
            },
        });
        return { examId: exam.id };
    });

    logger.info(`[Promote] Created new Exam ${examId} from StagedExam ${stagedExamId} · slug="${finalSlug}" · events=${eventRows.length}`);
    return { examId };
}

