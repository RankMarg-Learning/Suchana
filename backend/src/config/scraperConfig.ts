export interface SiteConfig {
    noiseSelectors: string[];
    contentSelectors: string[];
    listingLinkSelector: string;
    listingLinkFilter: (href: string) => boolean;
}

export const SITE_CONFIGS: Record<string, SiteConfig> = {
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

export function getSiteConfig(url: string): SiteConfig {
    try {
        const hostname = new URL(url).hostname.replace(/^www\./, '');
        if (SITE_CONFIGS[hostname]) return SITE_CONFIGS[hostname];
    } catch { }
    return {
        noiseSelectors: ['header', 'footer', 'nav', '.sidebar', 'script', 'style', 'noscript', '.ad'],
        contentSelectors: ['main', 'article', '.content', '#content', '.post-content', 'table'],
        listingLinkSelector: 'h2 a, h3 a, article a',
        listingLinkFilter: (_href) => true,
    };
}
