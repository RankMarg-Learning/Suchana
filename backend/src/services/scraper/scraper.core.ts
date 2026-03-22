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
}
