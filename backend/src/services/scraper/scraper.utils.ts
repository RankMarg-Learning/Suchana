import * as cheerio from 'cheerio';
import { getSiteConfig } from '../../config/scraperConfig';

export class ScraperUtils {
    static async fetchHtml(url: string): Promise<string> {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            },
            signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} [${url}]: ${res.statusText}`);
        return res.text();
    }

    static cleanHtml(html: string, url: string): { text: string; charCount: number; extractedLinks?: Record<string, string> } {
        const config = getSiteConfig(url);
        const $ = cheerio.load(html);
        config.noiseSelectors.forEach(sel => $(sel).remove());
        $('script, style, noscript, iframe, .ad, .advertisement').remove();

        const extractedLinks = url.includes('sarkariresult.com.cm') ? this.extractUsefulLinks(html, url) : undefined;
        let contentText = '';

        if (url.includes('sarkariresult.com.cm')) {
            contentText = this.extractSarkariResultContent($);
        }

        if (!contentText.trim()) {
            for (const selector of config.contentSelectors) {
                const el = $(selector);
                if (el.length) {
                    contentText = el.map((_, e) => $(e).text()).get().join('\n');
                    if (contentText.trim().length > 300) break;
                }
            }
        }

        if (!contentText.trim()) contentText = $('body').text();

        let cleaned = this.decodeEntities(contentText)
            .replace(/\t/g, ' ')
            .replace(/ {2,}/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();

        if (extractedLinks && Object.keys(extractedLinks).length > 0) {
            cleaned += 'SOME USEFUL IMPORTANT LINKS:\n';
            for (const [label, link] of Object.entries(extractedLinks)) {
                cleaned += `- ${label}: ${link}\n`;
            }
        }

        return {
            text: cleaned.slice(0, 7000),
            charCount: cleaned.length,
            extractedLinks
        };
    }

    private static extractSarkariResultContent($: cheerio.CheerioAPI): string {
        const targetKeywords = [
            'Important Dates',
            'Application Fee',
            'Age Limit',
            'Vacancy Details',
            'Eligibility Criteria',
            'Mode Of Selection',
            'Total Post'
        ];

        let content = '';
        const seenLines = new Set<string>();

        $('table, .gb-container, .entry-content').each((_, container) => {
            const $container = $(container);

            if ($container.parents('table, .gb-container, .entry-content').length > 0) return;

            const containerText = $container.text();
            if (targetKeywords.some(kw => new RegExp(kw, 'i').test(containerText))) {

                $container.find('h1, h2, h3, h4, h5, h6, li, p, tr').each((_, sub) => {
                    const $sub = $(sub);

                    if ($sub.find('h1, h2, h3, h4, h5, h6, li, p, tr').length > 0 &&
                        !sub.name?.toLowerCase().match(/^h[1-6]$/)) return;

                    let rowData = '';
                    const tag = sub.name ? sub.name.toLowerCase() : '';

                    if (tag === 'tr') {
                        rowData = $sub.find('td, th').map((_, cell) => $(cell).text().replace(/\s+/g, ' ').trim())
                            .get().filter(t => t).join(' : ');
                    } else {
                        rowData = $sub.text().replace(/\s+/g, ' ').trim();
                    }

                    if (!rowData) return;
                    const normalized = rowData.toLowerCase();
                    if (seenLines.has(normalized)) return;

                    const isHeading = tag.match(/^h[1-6]$/);
                    const hasData = rowData.includes(':') || /\d/.test(rowData);
                    const isKeywordMatch = targetKeywords.some(kw => new RegExp(kw, 'i').test(rowData));

                    const isNoise = /whatsapp|telegram|join our|follow now|click here|youtube|instagram|facebook|download app|play store|related post|latest post/i.test(rowData);

                    if ((isHeading || hasData || isKeywordMatch) && !isNoise) {
                        seenLines.add(normalized);
                        if (tag === 'li') {
                            content += `- ${rowData}\n`;
                        } else if (isHeading) {
                            content += `\n### ${rowData}\n`;
                        } else {
                            content += `${rowData}\n`;
                        }
                    }
                });
                content += '\n';
            }
        });

        return content;
    }

    static extractUsefulLinks(html: string, baseUrl: string): Record<string, string> {
        const $ = cheerio.load(html);
        const usefulLinks: Record<string, string> = {};
        const domain = 'sarkariresult.com.cm';

        $('table').each((_, table) => {
            const $table = $(table);
            const tableText = $table.text().toLowerCase();

            const hasKeyword = tableText.includes('important links') || tableText.includes('useful links');

            const hasMarkerClass = $table.prevAll('.importaint_links, .important_links').length > 0;

            if (hasKeyword || hasMarkerClass) {
                $table.find('tr').each((_, tr) => {
                    $(tr).find('a').each((_, a) => {
                        const href = $(a).attr('href');
                        if (!href) return;

                        const currentTd = $(a).closest('td');
                        let label = currentTd.prev().text().replace(/\s+/g, ' ').trim();

                        if (!label || label.toLowerCase() === 'click here') {
                            label = $(a).text().replace(/\s+/g, ' ').trim();
                        }

                        if (!label) {
                            label = $(tr).find('td').first().text().replace(/\s+/g, ' ').trim();
                        }

                        try {
                            const fullUrl = new URL(href, baseUrl).toString();
                            const urlObj = new URL(fullUrl);
                            const hostname = urlObj.hostname.toLowerCase();

                            if (hostname.includes(domain)) return;
                            if (hostname.includes('whatsapp.com')) return;
                            if (hostname.includes('t.me') || hostname.includes('telegram.org')) return;
                            if (hostname.includes('play.google.com')) return;

                            label = label
                                .replace(/Click Here/gi, '')
                                .replace(/<b>|<i>|<strong>|<span>/gi, '')
                                .replace(/<\/b>|<\/i>|<\/strong>|<\/span>/gi, '')
                                .replace(/:/g, '')
                                .replace(/\n/g, ' ')
                                .replace(/\s+/g, ' ')
                                .trim();

                            if (label && fullUrl && label.toLowerCase() !== 'hindi' && label.toLowerCase() !== 'english') {
                                if (label === '|') label = currentTd.prev().text().trim();
                                usefulLinks[label] = fullUrl;
                            } else if (label && fullUrl) {
                                const rowLabel = currentTd.prev().text().replace(/\s+/g, ' ').trim();
                                const finalLabel = rowLabel ? `${rowLabel} (${label})` : label;
                                usefulLinks[finalLabel] = fullUrl;
                            }
                        } catch { }
                    });
                });
            }
        });

        return usefulLinks;
    }

    static extractTargetSections(html: string, headingKeywords: string[], targetClasses: string[]): string {
        const $ = cheerio.load(html);
        let extractedHtml = '';

        if (headingKeywords && headingKeywords.length > 0) {
            $('h2, h3, h4').each((_, el) => {
                const lowerText = $(el).text().toLowerCase();
                if (headingKeywords.some(kw => lowerText.includes(kw))) {
                    const tagName = el.tagName.toLowerCase();
                    extractedHtml += `<${tagName}>${$(el).text()}</${tagName}>`;
                    let nextNode = $(el).next();
                    while (nextNode.length && !['h2', 'h3', 'h4'].includes(nextNode[0].name.toLowerCase())) {
                        extractedHtml += $.html(nextNode);
                        nextNode = nextNode.next();
                    }
                }
            });
        }

        if (targetClasses && targetClasses.length > 0) {
            targetClasses.forEach(cls => {
                $(cls).each((_, el) => {
                    extractedHtml += $.html(el);
                });
            });
        }

        return extractedHtml;
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
