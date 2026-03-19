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
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.text();
    }

    static cleanHtml(html: string, url: string): { text: string; charCount: number } {
        const config = getSiteConfig(url);
        console.log("config", config)
        const $ = cheerio.load(html);
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
}
