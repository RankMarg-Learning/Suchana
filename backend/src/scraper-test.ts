// ============================================================
// src/scraper-test.ts  — Quick scraper test for freejobalert.com
// Run: npx ts-node src/scraper-test.ts
// ============================================================
import * as cheerio from 'cheerio';

const BASE_URL = 'https://www.freejobalert.com';

async function fetchHtml(url: string): Promise<string> {
    const res = await fetch(url, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
        },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.text();
}

async function testLatestJobs() {
    console.log('\n━━━ TEST 1: Latest Jobs ━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const html = await fetchHtml(BASE_URL);
    const $ = cheerio.load(html);

    const jobs: { title: string; href: string }[] = [];

    $('h2 a, .entry-title a, table a').each((_, el) => {
        if (jobs.length >= 15) return;
        const title = $(el).text().trim();
        const href = $(el).attr('href') ?? '';
        if (title && href.startsWith('http')) {
            jobs.push({ title, href });
        }
    });

    if (jobs.length === 0) {
        console.log('⚠️  No jobs found — selectors may need adjustment');
    } else {
        console.log(`✅  Found ${jobs.length} job entries:\n`);
        jobs.forEach((j, i) => console.log(`  ${i + 1}. ${j.title}\n     ${j.href}`));
    }

    return jobs;
}

// ─── Test 2: Scrape a single job detail page ─────────────────
async function testJobDetail(url: string) {
    console.log(`\n━━━ TEST 2: Job Detail Page ━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`  URL: ${url}\n`);
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const title = $("h1.entry-title").text().trim();
    const updatedTime = $("time.published").attr("datetime");

    const tables: { headers: string[]; rows: string[][] }[] = [];

    $("table").each((_, table) => {
        const headers: string[] = [];
        const rows: string[][] = [];

        $(table).find("th").each((_, th) => {
            headers.push($(th).text().trim());
        });

        $(table).find("tr").each((_, tr) => {
            const cells = $(tr).find("td").map((_, td) => $(td).text().trim()).get();
            if (cells.length) rows.push(cells);
        });

        if (rows.length) tables.push({ headers, rows });
    });

    console.log(`\n📌 Title   : ${title}`);
    console.log(`🕒 Updated : ${updatedTime ?? 'N/A'}`);
    console.log(`📋 Tables  : ${tables.length} found\n`);

    tables.forEach((t, i) => {
        console.log(`  ── Table ${i + 1} ─────────────────────────`);
        if (t.headers.length) {
            console.log(`  Headers: ${t.headers.join(' | ')}`);
        }
        t.rows.forEach((row, r) => {
            console.log(`  Row ${String(r + 1).padStart(2, '0')} : ${row.join(' | ')}`);
        });
        console.log('');
    });

}


(async () => {
    console.log('🔍 Suchana Scraper Test — freejobalert.com');
    console.log('==========================================');

    try {

        await testJobDetail("https://www.freejobalert.com/articles/aiims-norcet-10-recruitment-notification-2026-3037255");


        console.log('\n✅  All tests completed.\n');
    } catch (err: any) {
        console.error('\n❌  Test failed:', err.message);
        process.exit(1);
    }
})();
