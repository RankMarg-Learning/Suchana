import prisma from '../../config/database';
import { logger } from '../../utils/logger';
import { checkAndStage } from '../deduplication.service';
import { ScrapeJobStatus } from '../../constants/enums';
import { AIProvider } from './ai.provider';
import { ScraperUtils } from './scraper.utils';
import { ScrapeSourceConfig, ScrapeResult, DeduplicationSummary } from './scraper.types';

export class ScraperService {
    static async scrapePage(jobId: string, url: string, hintCategory?: string): Promise<DeduplicationSummary> {
        try {
            logger.info(`[Scraper] Processing: ${url}`);
            const html = await ScraperUtils.fetchHtml(url);

            let htmlToProcess = html;
            if (url.includes('testbook.com')) {
                const extractedHtml = ScraperUtils.extractTargetSections(
                    html,
                    ['updates', 'overview', 'important dates'],
                    ['.table-responsive']
                );
                if (extractedHtml) {
                    htmlToProcess = `<article>${extractedHtml}</article>`;
                }
            } else if (url.includes('sarkariresult.com.cm')) {
                const extractedHtml = ScraperUtils.extractTargetSections(
                    html,
                    [],
                    ['.gb-container']
                );
                if (extractedHtml) {
                    htmlToProcess = `<article>${extractedHtml}</article>`;
                }
            } else if (url.includes('jobapply24.in')) {
                const extractedHtml = ScraperUtils.extractTargetSections(
                    html,
                    [],
                    ['.entry-content']
                );
                if (extractedHtml) {
                    htmlToProcess = `<article>${extractedHtml}</article>`;
                }
            }

            const { text, charCount, extractedLinks } = ScraperUtils.cleanHtml(htmlToProcess, url);

            const extracted = await AIProvider.extractExamData(text, url, hintCategory);
            if (!extracted) {
                return { sourceUrl: url, outcome: 'AI_FAILED', reason: 'AI failed to parse content' };
            }

            extracted.sourceUrl = url;
            extracted.scrapedAt = new Date();

            const dedup = await checkAndStage(jobId, extracted);

            return {
                sourceUrl: url,
                outcome: dedup.outcome,
                stagedExamId: 'stagedExamId' in dedup ? (dedup as any).stagedExamId : undefined,
                existingExamId: 'existingExamId' in dedup ? (dedup as any).existingExamId : undefined,
                canonicalStagedExamId: 'canonicalStagedExamId' in dedup ? (dedup as any).canonicalStagedExamId : undefined,
                reason: 'reason' in dedup ? (dedup as any).reason : undefined,
            };
        } catch (err: any) {
            logger.error(`[Scraper] Failed ${url}: ${err.message}`);
            return { sourceUrl: url, outcome: 'ERROR', reason: err.message };
        }
    }

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

    static async scrapeText(text: string, sourceUrl: string, hintCategory?: string): Promise<DeduplicationSummary> {
        // 1. Ensure a "Manual" source exists
        let source = await prisma.scrapeSource.findFirst({
            where: { label: 'Manual Input' }
        });

        if (!source) {
            source = await prisma.scrapeSource.create({
                data: {
                    label: 'Manual Input',
                    url: 'https://manual-input.com',
                    sourceType: 'DETAIL',
                    isActive: true
                }
            });
        }

        // 2. Create a job for this manual action
        const job = await prisma.scrapeJob.create({
            data: {
                scrapeSourceId: source.id,
                status: ScrapeJobStatus.RUNNING
            }
        });

        try {
            // 3. Extract data using AI
            const extracted = await AIProvider.extractExamData(text, sourceUrl, hintCategory);
            if (!extracted) {
                await prisma.scrapeJob.update({
                    where: { id: job.id },
                    data: { status: ScrapeJobStatus.FAILED, errorMessage: 'AI extraction failed' }
                });
                return { sourceUrl, outcome: 'AI_FAILED' as any, reason: 'AI failed to parse content' };
            }

            extracted.sourceUrl = sourceUrl;
            extracted.scrapedAt = new Date();

            // 4. Deduplicate and Stage
            const dedup = await checkAndStage(job.id, extracted);

            const candidatesFound = ['NEW_STAGED', 'LINKED_AS_UPDATE'].includes(dedup.outcome) ? 1 : 0;

            await prisma.scrapeJob.update({
                where: { id: job.id },
                data: {
                    status: ScrapeJobStatus.COMPLETED,
                    candidatesFound,
                    completedAt: new Date(),
                    rawPayload: { mode: 'MANUAL_TEXT', outcome: dedup.outcome } as any
                }
            });

            return {
                sourceUrl,
                outcome: dedup.outcome,
                stagedExamId: (dedup as any).stagedExamId,
                existingExamId: (dedup as any).existingExamId,
                canonicalStagedExamId: (dedup as any).canonicalStagedExamId,
                reason: (dedup as any).reason,
            } as DeduplicationSummary;

        } catch (err: any) {
            logger.error(`[Scraper] scrapeText failed: ${err.message}`);
            await prisma.scrapeJob.update({
                where: { id: job.id },
                data: { status: ScrapeJobStatus.FAILED, errorMessage: err.message, completedAt: new Date() }
            });
            return { sourceUrl, outcome: 'ERROR' as any, reason: err.message };
        }
    }
}

