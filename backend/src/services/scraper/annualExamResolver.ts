import prisma from '../../config/database';
import { logger } from '../../utils/logger';
import { ExamCategory, ExamLevel } from '../../constants/enums';

export interface AuthorityResolutionResult {
    conductingBody: string;
    category: string;
    examLevel: string;
    state?: string;
    officialWebsite?: string;
    source: 'HISTORICAL_EXAM' | 'MASTER_REGISTRY' | 'PAGE_EXTRACTION' | 'FALLBACK';
}

interface MasterRegistryEntry {
    patterns: RegExp[];
    conductingBody: string;
    category: string;
    examLevel: string;
    state?: string;
    officialWebsite?: string;
}

/**
 * Master Registry of Indian Government Recruitment Authorities and Examination Boards.
 * Covers Central Commissions, Defense, Banking, Railways, State PSCs, Subordinate Boards, Courts, and Health Services.
 */
const MASTER_AUTHORITY_REGISTRY: MasterRegistryEntry[] = [
    // ─── Central Flagship Commissions ───────────────────────────────────────────
    {
        patterns: [/\bssc\b/i, /staff selection commission/i, /\bcgl\b/i, /\bchsl\b/i, /\bmts\b/i, /\bcpo\b/i, /gd constable/i, /stenographer.*ssc/i, /ssc.*stenographer/i, /selection phase/i],
        conductingBody: 'Staff Selection Commission (SSC)',
        category: ExamCategory.SSC,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://ssc.gov.in/',
    },
    {
        patterns: [/\bupsc\b/i, /union public service/i, /civil services/i, /\bias\b/i, /\bips\b/i, /\bnda\b/i, /\bcds\b/i, /\bcapf\b/i, /\bcms\b/i, /\bies\b/i],
        conductingBody: 'Union Public Service Commission (UPSC)',
        category: ExamCategory.UPSC,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://upsc.gov.in/',
    },
    {
        patterns: [/\brrb\b/i, /railway recruitment board/i, /\bntpc\b/i, /loco pilot/i, /\balp\b/i, /railway.*group d/i, /railway technician/i],
        conductingBody: 'Railway Recruitment Board (RRB)',
        category: ExamCategory.RAILWAY_JOBS,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://indianrailways.gov.in/',
    },
    {
        patterns: [/\bibps\b/i, /institute of banking personnel/i, /ibps.*clerk/i, /ibps.*po/i, /ibps.*rrb/i, /ibps.*so/i],
        conductingBody: 'Institute of Banking Personnel Selection (IBPS)',
        category: ExamCategory.BANKING_JOBS,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://www.ibps.in/',
    },
    {
        patterns: [/\bsbi\b/i, /state bank of india/i],
        conductingBody: 'State Bank of India (SBI)',
        category: ExamCategory.BANKING_JOBS,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://sbi.co.in/',
    },
    {
        patterns: [/\brbi\b/i, /reserve bank of india/i],
        conductingBody: 'Reserve Bank of India (RBI)',
        category: ExamCategory.BANKING_JOBS,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://rbi.org.in/',
    },
    {
        patterns: [/\bnagaland\b/i, /canara bank/i, /bank of baroda/i, /punjab national bank/i, /cooperative bank/i, /upcisb/i, /indian overseas bank/i],
        conductingBody: 'Banking Examination / Recruitment Board',
        category: ExamCategory.BANKING_JOBS,
        examLevel: ExamLevel.NATIONAL,
    },

    // ─── Defense & Paramilitary ────────────────────────────────────────────────
    {
        patterns: [/coast guard/i, /\bicg\b/i, /cgept/i],
        conductingBody: 'Indian Coast Guard (Ministry of Defence)',
        category: ExamCategory.DEFENCE_JOBS,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://joinindiancoastguard.cdac.in/',
    },
    {
        patterns: [/indian army/i, /army.*agniveer/i, /technical entry scheme/i, /\btes\b/i],
        conductingBody: 'Indian Army (Ministry of Defence)',
        category: ExamCategory.DEFENCE_JOBS,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://joinindianarmy.nic.in/',
    },
    {
        patterns: [/indian air\s*force/i, /airforce/i, /\biaf\b/i, /agniveer vayu/i, /afcat/i],
        conductingBody: 'Indian Air Force (IAF)',
        category: ExamCategory.DEFENCE_JOBS,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://agnipathvayu.cdac.in/',
    },
    {
        patterns: [/indian navy/i, /navy.*agniveer/i],
        conductingBody: 'Indian Navy (Ministry of Defence)',
        category: ExamCategory.DEFENCE_JOBS,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://joinindiannavy.gov.in/',
    },
    {
        patterns: [/assam rifles/i],
        conductingBody: 'Assam Rifles (Ministry of Home Affairs)',
        category: ExamCategory.DEFENCE_JOBS,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://www.assamrifles.gov.in/',
    },

    // ─── Judicial & Law Exams ──────────────────────────────────────────────────
    {
        patterns: [/delhi high court/i, /\bdhc\b/i],
        conductingBody: 'High Court of Delhi',
        category: ExamCategory.LAW_EXAM,
        examLevel: ExamLevel.STATE,
        state: 'Delhi',
        officialWebsite: 'https://delhihighcourt.nic.in/',
    },
    {
        patterns: [/rajasthan high court/i, /\brhc\b/i],
        conductingBody: 'Rajasthan High Court (RHC)',
        category: ExamCategory.LAW_EXAM,
        examLevel: ExamLevel.STATE,
        state: 'Rajasthan',
        officialWebsite: 'https://hcraj.nic.in/',
    },
    {
        patterns: [/patna high court/i],
        conductingBody: 'Patna High Court',
        category: ExamCategory.LAW_EXAM,
        examLevel: ExamLevel.STATE,
        state: 'Bihar',
        officialWebsite: 'https://patnahighcourt.gov.in/',
    },
    {
        patterns: [/mp high court/i, /madhya pradesh high court/i],
        conductingBody: 'High Court of Madhya Pradesh',
        category: ExamCategory.LAW_EXAM,
        examLevel: ExamLevel.STATE,
        state: 'Madhya Pradesh',
        officialWebsite: 'https://mphc.gov.in/',
    },
    {
        patterns: [/allahabad high court/i],
        conductingBody: 'High Court of Judicature at Allahabad',
        category: ExamCategory.LAW_EXAM,
        examLevel: ExamLevel.STATE,
        state: 'Uttar Pradesh',
        officialWebsite: 'https://www.allahabadhighcourt.in/',
    },
    {
        patterns: [/supreme court/i, /\bsci\b/i, /junior court assistant/i],
        conductingBody: 'Supreme Court of India (SCI)',
        category: ExamCategory.LAW_EXAM,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://main.sci.gov.in/',
    },
    {
        patterns: [/district court/i, /civil judge/i, /judicial assistant/i, /judicial service/i, /\bhjs\b/i, /\bapo\b/i],
        conductingBody: 'Judicial Services Examination Board',
        category: ExamCategory.LAW_EXAM,
        examLevel: ExamLevel.STATE,
    },

    // ─── Rajasthan State Authorities ───────────────────────────────────────────
    {
        patterns: [/safai karmchari/i, /local self government.*rajasthan/i, /\blsg\b.*rajasthan/i, /rajasthan.*safai/i],
        conductingBody: 'Local Self Government Department, Rajasthan (LSG)',
        category: ExamCategory.GOVERNMENT_JOBS,
        examLevel: ExamLevel.STATE,
        state: 'Rajasthan',
        officialWebsite: 'https://lsg.rajasthan.gov.in/',
    },
    {
        patterns: [/\bruhs\b/i, /rajasthan university of health sciences/i],
        conductingBody: 'Rajasthan University of Health Sciences (RUHS)',
        category: ExamCategory.MEDICAL_EXAM,
        examLevel: ExamLevel.STATE,
        state: 'Rajasthan',
        officialWebsite: 'https://ruhsraj.org/',
    },
    {
        patterns: [/\brpsc\b/i, /rajasthan public service commission/i],
        conductingBody: 'Rajasthan Public Service Commission (RPSC)',
        category: ExamCategory.STATE_PSC,
        examLevel: ExamLevel.STATE,
        state: 'Rajasthan',
        officialWebsite: 'https://rpsc.rajasthan.gov.in/',
    },
    {
        patterns: [/\brssb\b/i, /\brsmssb\b/i, /rajasthan staff selection/i],
        conductingBody: 'Rajasthan Staff Selection Board (RSSB)',
        category: ExamCategory.GOVERNMENT_JOBS,
        examLevel: ExamLevel.STATE,
        state: 'Rajasthan',
        officialWebsite: 'https://rsmssb.rajasthan.gov.in/',
    },
    {
        patterns: [/rajasthan police/i],
        conductingBody: 'Rajasthan Police Recruitment Board',
        category: ExamCategory.POLICE_JOBS,
        examLevel: ExamLevel.STATE,
        state: 'Rajasthan',
        officialWebsite: 'https://police.rajasthan.gov.in/',
    },

    // ─── Uttar Pradesh State Authorities ───────────────────────────────────────
    {
        patterns: [/\bupsssc\b/i, /up subordinate/i],
        conductingBody: 'Uttar Pradesh Subordinate Services Selection Commission (UPSSSC)',
        category: ExamCategory.GOVERNMENT_JOBS,
        examLevel: ExamLevel.STATE,
        state: 'Uttar Pradesh',
        officialWebsite: 'https://upsssc.gov.in/',
    },
    {
        patterns: [/\buppsc\b/i, /up public service commission/i],
        conductingBody: 'Uttar Pradesh Public Service Commission (UPPSC)',
        category: ExamCategory.STATE_PSC,
        examLevel: ExamLevel.STATE,
        state: 'Uttar Pradesh',
        officialWebsite: 'https://uppsc.up.nic.in/',
    },
    {
        patterns: [/up police/i, /upprpb/i, /up cop/i, /up home guard/i],
        conductingBody: 'Uttar Pradesh Police Recruitment and Promotion Board (UPPRPB)',
        category: ExamCategory.POLICE_JOBS,
        examLevel: ExamLevel.STATE,
        state: 'Uttar Pradesh',
        officialWebsite: 'https://uppbpb.gov.in/',
    },
    {
        patterns: [/upessc/i, /up assistant teacher/i, /up lt grade/i, /up tgt/i, /up pgt/i],
        conductingBody: 'Uttar Pradesh Education Service Selection Commission (UPESSC)',
        category: ExamCategory.TEACHING_ELIGIBILITY,
        examLevel: ExamLevel.STATE,
        state: 'Uttar Pradesh',
    },

    // ─── Bihar State Authorities ───────────────────────────────────────────────
    {
        patterns: [/\bbpsc\b/i, /bihar public service/i],
        conductingBody: 'Bihar Public Service Commission (BPSC)',
        category: ExamCategory.STATE_PSC,
        examLevel: ExamLevel.STATE,
        state: 'Bihar',
        officialWebsite: 'https://bpsc.bih.nic.in/',
    },
    {
        patterns: [/\bcsbc\b/i, /bihar police.*constable/i, /central selection board.*constable/i],
        conductingBody: 'Central Selection Board of Constable, Bihar (CSBC)',
        category: ExamCategory.POLICE_JOBS,
        examLevel: ExamLevel.STATE,
        state: 'Bihar',
        officialWebsite: 'https://csbc.bih.nic.in/',
    },
    {
        patterns: [/\bbpssc\b/i, /bihar police sub-ordinate/i, /bihar.*daroga/i],
        conductingBody: 'Bihar Police Sub-ordinate Services Commission (BPSSC)',
        category: ExamCategory.POLICE_JOBS,
        examLevel: ExamLevel.STATE,
        state: 'Bihar',
        officialWebsite: 'https://bpssc.bih.nic.in/',
    },
    {
        patterns: [/\bbssc\b/i, /bihar staff selection/i],
        conductingBody: 'Bihar Staff Selection Commission (BSSC)',
        category: ExamCategory.GOVERNMENT_JOBS,
        examLevel: ExamLevel.STATE,
        state: 'Bihar',
        officialWebsite: 'https://bssc.bihar.gov.in/',
    },
    {
        patterns: [/bihar stet/i, /bseb.*stet/i],
        conductingBody: 'Bihar School Examination Board (BSEB)',
        category: ExamCategory.TEACHING_ELIGIBILITY,
        examLevel: ExamLevel.STATE,
        state: 'Bihar',
        officialWebsite: 'https://bsebstet.org/',
    },

    // ─── Madhya Pradesh State Authorities ──────────────────────────────────────
    {
        patterns: [/\bmpesb\b/i, /mp employees selection/i, /vyapam/i, /patwari/i, /van rakshak/i, /sub engineer.*mp/i],
        conductingBody: 'Madhya Pradesh Employees Selection Board (MPESB)',
        category: ExamCategory.GOVERNMENT_JOBS,
        examLevel: ExamLevel.STATE,
        state: 'Madhya Pradesh',
        officialWebsite: 'https://esb.mp.gov.in/',
    },
    {
        patterns: [/\bmppsc\b/i, /mp public service/i],
        conductingBody: 'Madhya Pradesh Public Service Commission (MPPSC)',
        category: ExamCategory.STATE_PSC,
        examLevel: ExamLevel.STATE,
        state: 'Madhya Pradesh',
        officialWebsite: 'https://mppsc.mp.gov.in/',
    },
    {
        patterns: [/mp police/i],
        conductingBody: 'Madhya Pradesh Police Headquarters',
        category: ExamCategory.POLICE_JOBS,
        examLevel: ExamLevel.STATE,
        state: 'Madhya Pradesh',
    },

    // ─── Delhi State Authorities ───────────────────────────────────────────────
    {
        patterns: [/\bdsssb\b/i, /delhi subordinate/i],
        conductingBody: 'Delhi Subordinate Services Selection Board (DSSSB)',
        category: ExamCategory.GOVERNMENT_JOBS,
        examLevel: ExamLevel.STATE,
        state: 'Delhi',
        officialWebsite: 'https://dsssb.delhi.gov.in/',
    },
    {
        patterns: [/delhi police/i],
        conductingBody: 'Delhi Police Recruitment Cell',
        category: ExamCategory.POLICE_JOBS,
        examLevel: ExamLevel.STATE,
        state: 'Delhi',
    },

    // ─── National Health / Medical ─────────────────────────────────────────────
    {
        patterns: [/\baiims\b/i, /\bnorcet\b/i, /nursing officer.*aiims/i],
        conductingBody: 'All India Institute of Medical Sciences (AIIMS)',
        category: ExamCategory.MEDICAL_EXAM,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://www.aiimsexams.ac.in/',
    },
    {
        patterns: [/medical officer/i, /staff nurse/i, /\bcho\b/i, /community health officer/i, /health services/i],
        conductingBody: 'Department of Health & Family Welfare',
        category: ExamCategory.MEDICAL_EXAM,
        examLevel: ExamLevel.STATE,
    },

    // ─── Central Other Public Sector ───────────────────────────────────────────
    {
        patterns: [/india post/i, /\bgds\b/i, /gramin dak sevak/i],
        conductingBody: 'Department of Posts, Ministry of Communications (India Post)',
        category: ExamCategory.GOVERNMENT_JOBS,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://indiapostgdsonline.gov.in/',
    },
    {
        patterns: [/\bisro\b/i, /\bicrb\b/i, /space research/i],
        conductingBody: 'Indian Space Research Organisation (ISRO)',
        category: ExamCategory.GOVERNMENT_JOBS,
        examLevel: ExamLevel.NATIONAL,
        officialWebsite: 'https://www.isro.gov.in/',
    },
    {
        patterns: [/\bnicl\b/i, /national insurance company/i, /\bniacl\b/i, /\blic\b/i, /life insurance/i],
        conductingBody: 'Public Sector Insurance Corporation',
        category: ExamCategory.GOVERNMENT_JOBS,
        examLevel: ExamLevel.NATIONAL,
    },
];

const STATE_KEYWORDS = [
    { name: 'Rajasthan', patterns: [/\brajasthan\b/i, /\brpsc\b/i, /\brsmssb\b/i, /\brssb\b/i, /\bruhs\b/i, /\bjaipur\b/i] },
    { name: 'Uttar Pradesh', patterns: [/\bup\b/i, /uttar pradesh/i, /\buppsc\b/i, /\bupsssc\b/i, /\bupprpb\b/i, /\blucknow\b/i] },
    { name: 'Bihar', patterns: [/\bbihar\b/i, /\bbpsc\b/i, /\bcsbc\b/i, /\bbpssc\b/i, /\bbssc\b/i, /\bpatna\b/i] },
    { name: 'Madhya Pradesh', patterns: [/\bmp\b/i, /madhya pradesh/i, /\bmppsc\b/i, /\bmpesb\b/i, /\bbhopal\b/i] },
    { name: 'Delhi', patterns: [/\bdelhi\b/i, /\bdsssb\b/i, /\bdhc\b/i] },
    { name: 'Haryana', patterns: [/\bharyana\b/i, /\bhpsc\b/i, /\bhssc\b/i] },
    { name: 'Jharkhand', patterns: [/\bjharkhand\b/i, /\bjpsc\b/i, /\bjssc\b/i] },
    { name: 'Uttarakhand', patterns: [/\buttarakhand\b/i, /\bukpsc\b/i, /\buksssc\b/i] },
    { name: 'Punjab', patterns: [/\bpunjab\b/i, /\bppsc\b/i, /\bsssb punjab\b/i] },
    { name: 'Maharashtra', patterns: [/\bmaharashtra\b/i, /\bmpsc\b/i, /\bmumbai\b/i] },
    { name: 'Gujarat', patterns: [/\bgujarat\b/i, /\bgpsc\b/i] },
    { name: 'West Bengal', patterns: [/\bwest bengal\b/i, /\bwbpsc\b/i, /\bkolkata\b/i] },
];

export class AnnualExamResolver {
    /**
     * Normalizes a slug to its base recurring exam family name.
     * E.g. "ssc-cgl-2026" -> "ssc-cgl"
     *      "rajasthan-safai-karmchari-2026" -> "rajasthan-safai-karmchari"
     *      "ibps-clerk-16th-2026" -> "ibps-clerk"
     *      "delhi-high-court-jja-2026" -> "delhi-high-court-jja"
     *      "indian-coast-guard-cgept-01-2027-02-2027" -> "indian-coast-guard-cgept"
     */
    static normalizeRootSlug(slug: string): string {
        return slug
            .replace(/-\d{4}(?:-\d{2,4})?$/i, '') // strip -2026, -2026-27
            .replace(/-(?:1st|2nd|3rd|\d+th)$/i, '') // strip -16th
            .replace(/-phase-\d+$/i, '') // strip -phase-14
            .replace(/-tier-[12]$/i, '') // strip -tier-1
            .replace(/-(?:01|02|03|04|05|06|07|08|09|10)-\d{4}$/i, '') // strip -06-2026
            .replace(/-(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(?:-\d{2,4})?$/i, '') // strip -sep26, -july-2026
            .trim();
    }

    /**
     * Resolves the authoritative conducting body, category, state, and exam level for an exam.
     * Tier 1: Look for historical/annual edition in database (Exam table)
     * Tier 2: Check Master Authority Registry (covering 60+ agencies)
     * Tier 3: Extract from first paragraph on the page (P2)
     * Tier 4: Fallback based on keywords
     */
    static async resolveAuthority(
        slug: string,
        cleanTitle: string,
        pageIntroText?: string
    ): Promise<AuthorityResolutionResult> {
        const rootSlug = this.normalizeRootSlug(slug);
        const searchCorpus = `${slug} ${cleanTitle}`.toLowerCase();

        // ─── TIER 1: Check existing approved / published recurring editions in DB ──
        try {
            const historicalExam = await prisma.exam.findFirst({
                where: {
                    isPublished: true,
                    slug: { not: slug },
                    OR: [
                        { slug: { startsWith: rootSlug } },
                        { slug: { contains: rootSlug } },
                    ],
                },
                orderBy: { examYear: 'desc' },
                select: {
                    conductingBody: true,
                    category: true,
                    examLevel: true,
                    state: true,
                    officialWebsite: true,
                },
            });

            if (
                historicalExam &&
                historicalExam.conductingBody &&
                !/unknown|government examination board|examination cell|services examination board/i.test(historicalExam.conductingBody)
            ) {
                logger.info(`[AnnualExamResolver] Found recurring match in database for ${slug} -> Root: ${rootSlug} | ConductingBody: "${historicalExam.conductingBody}"`);
                return {
                    conductingBody: historicalExam.conductingBody,
                    category: historicalExam.category,
                    examLevel: historicalExam.examLevel,
                    state: historicalExam.state ?? undefined,
                    officialWebsite: historicalExam.officialWebsite ?? undefined,
                    source: 'HISTORICAL_EXAM',
                };
            }
        } catch (err: any) {
            logger.warn(`[AnnualExamResolver] DB lookup failed: ${err.message}`);
        }

        // ─── TIER 2: Match against Master Authority Registry ──────────────────────
        for (const entry of MASTER_AUTHORITY_REGISTRY) {
            if (entry.patterns.some((p) => p.test(searchCorpus))) {
                logger.debug(`[AnnualExamResolver] Master registry matched for ${slug} -> "${entry.conductingBody}"`);
                return {
                    conductingBody: entry.conductingBody,
                    category: entry.category,
                    examLevel: entry.examLevel,
                    state: entry.state,
                    officialWebsite: entry.officialWebsite,
                    source: 'MASTER_REGISTRY',
                };
            }
        }

        // ─── TIER 3: Extract department directly from page intro text (P2) ─────────
        if (pageIntroText && pageIntroText.length > 20) {
            const extracted = this.extractAuthorityFromIntro(pageIntroText);
            if (extracted) {
                const inferredState = this.inferState(extracted + ' ' + searchCorpus);
                const inferredCategory = this.inferCategory(searchCorpus);
                logger.info(`[AnnualExamResolver] Page DOM extracted conducting body for ${slug} -> "${extracted}"`);
                return {
                    conductingBody: extracted,
                    category: inferredCategory,
                    examLevel: inferredState ? ExamLevel.STATE : ExamLevel.NATIONAL,
                    state: inferredState,
                    source: 'PAGE_EXTRACTION',
                };
            }
        }

        // ─── TIER 4: Fallback Heuristic ───────────────────────────────────────────
        const inferredState = this.inferState(searchCorpus);
        const inferredCategory = this.inferCategory(searchCorpus);
        const conductingBody = inferredState
            ? `${inferredState} Examination & Recruitment Board`
            : 'Central Examination Board';

        return {
            conductingBody,
            category: inferredCategory,
            examLevel: inferredState ? ExamLevel.STATE : ExamLevel.NATIONAL,
            state: inferredState,
            source: 'FALLBACK',
        };
    }

    /**
     * Extracts the opening organization name from paragraph 2:
     * e.g., "Local Self Government Department, Rajasthan, has released a notification..."
     *    -> "Local Self Government Department, Rajasthan"
     */
    private static extractAuthorityFromIntro(introText: string): string | null {
        const cleaned = introText.replace(/^post date:.*?\n/i, '').trim();

        const match = cleaned.match(
            /^([A-Za-z0-9\s,\.\(\)&\/\-]+?)(?:,\s*(?:has|have|is|are)|(?:\s+(?:has|have|is|are)\s+(?:released|announced|invited|issued|published|started|conducted)))/i
        );

        if (match && match[1]) {
            let candidate = match[1].replace(/^(?:the|an|a)\s+/i, '').trim();
            // Filter out junk
            if (candidate.length >= 4 && candidate.length <= 90 && !/sarkari|result|today|important|candidates/i.test(candidate)) {
                return candidate.replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '');
            }
        }

        return null;
    }

    private static inferState(text: string): string | undefined {
        for (const st of STATE_KEYWORDS) {
            if (st.patterns.some((p) => p.test(text))) {
                return st.name;
            }
        }
        return undefined;
    }

    private static inferCategory(text: string): string {
        if (/police|constable|daroga|sub inspector|\bsi\b/i.test(text)) return ExamCategory.POLICE_JOBS;
        if (/teacher|tet|prt|tgt|pgt|education|school/i.test(text)) return ExamCategory.TEACHING_ELIGIBILITY;
        if (/medical|doctor|nurse|nursing|health|hospital|mbbs|pharmacist/i.test(text)) return ExamCategory.MEDICAL_EXAM;
        if (/court|law|judicial|judiciary|advocate|prosecutor/i.test(text)) return ExamCategory.LAW_EXAM;
        if (/bank|clerk|po\b|manager|cooperative/i.test(text)) return ExamCategory.BANKING_JOBS;
        if (/railway|\brrb\b|\balp\b|\bntpc\b/i.test(text)) return ExamCategory.RAILWAY_JOBS;
        if (/defence|army|navy|air force|coast guard|military/i.test(text)) return ExamCategory.DEFENCE_JOBS;
        if (/engineer|polytechnic|technical|je\b|\bae\b/i.test(text)) return ExamCategory.ENGINEERING_EXAM;
        return ExamCategory.GOVERNMENT_JOBS;
    }
}
