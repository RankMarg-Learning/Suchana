import OpenAI from 'openai';
import { logger } from '../../utils/logger';
import { env } from '../../config/env';
import { AiStructuredExam } from '../deduplication.service';
import {
  EXAM_CATEGORIES,
  EXAM_LEVELS,
  LIFECYCLE_STAGES,
} from '../../constants/enums';

export class AIProvider {
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
        model: 'gpt-4o-mini0',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 4000,
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

HINT CATEGORY: ${hintCategory ?? 'auto-detect'}
CURRENT YEAR: ${this.CURRENT_YEAR}

CRITICAL EXTRACTION RULES
RULE 1 - From EXAM IDENTIFY THE TIMELINE OF THE EXAM (ONLY CENTERAL EXAM & STATE GRADE A EXAMS)
RULE 2 — EXTRACT EVERY SINGLE EVENT (NO SKIPPING)
The OPTIONAL stages — include ONLY when source text contains explicit data for them:
  ANSWER_KEY  (skip entirely if no answer key date/mention exists — do NOT add a TBD placeholder)
  DOCUMENT_VERIFICATION  (include only if mentioned)
  JOINING  (include only if mentioned)

For every MANDATORY stage that has NO date in the source text, you MUST still create a
placeholder event with:
  - isTBD: true
  - startsAt: null
  - endsAt: null
  - title: "<Stage Name> (To Be Announced)"
Do NOT silently drop any mandatory stage. Do NOT add TBD placeholders for optional stages.

──────────────────────────────────────
RULE 2 — MULTI-PHASE / MULTI-TIER EXAM HANDLING
──────────────────────────────────────
If the exam has multiple distinct phases, tiers, or papers (e.g., Tier 1 and Tier 2,
Prelims and Mains, Paper 1 and Paper 2), EACH phase MUST produce its OWN separate set
of events. Never merge dates from different phases into a single event.

stageOrder OFFSETS per phase:
  - Phase 1 / Tier 1 / Prelims → base values   (ADMIT_CARD=30, EXAM=40, ANSWER_KEY=50, RESULT=60)
  - Phase 2 / Tier 2 / Mains   → +100 offset   (ADMIT_CARD=130, EXAM=140, ANSWER_KEY=150, RESULT=160)
  - Phase 3 / Tier 3           → +200 offset   (ADMIT_CARD=230, EXAM=240, ANSWER_KEY=250, RESULT=260)
  - Each additional phase       → +100 more

NOTIFICATION (stageOrder=10) and REGISTRATION (stageOrder=20) are shared for the whole exam.
Create only ONE notification event and ONE registration event regardless of the number of phases.

For each individual phase, create SEPARATE events for:
  ✓ ADMIT_CARD  (one per phase, labeled "Tier 1 Admit Card", "Tier 2 Admit Card", etc.)
  ✓ EXAM        (one per phase — NEVER merge Tier 1 and Tier 2 into one EXAM event)
  ✓ ANSWER_KEY  (one per phase, only if answer key data is found for that phase)
  ✓ RESULT      (one per phase, labeled "Tier 1 Result", "Tier 2 Result", etc.)

Example for SSC CGL (2-tier):
  stageOrder=10  → Notification
  stageOrder=20  → Registration (single event with open+close dates)
  stageOrder=30  → Tier 1 Admit Card
  stageOrder=40  → Tier 1 Exam (with date range if multi-day)
  stageOrder=50  → Tier 1 Answer Key — only if data present
  stageOrder=60  → Tier 1 Result
  stageOrder=130 → Tier 2 Admit Card
  stageOrder=140 → Tier 2 Exam (with date range if multi-day)
  stageOrder=150 → Tier 2 Answer Key — only if data present
  stageOrder=160 → Tier 2 Result

Label each event title with the phase name to prevent ambiguity.

──────────────────────────────────────
RULE 3 — PER-STAGE EXTRACTION GUIDE
──────────────────────────────────────
NOTIFICATION (stageOrder=10):
  - Capture the date the official notification/advertisement was published.
  - startsAt = notification release date, endsAt = null
  - actionUrl = notificationUrl if available
  - actionLabel = "View Notification"

REGISTRATION (stageOrder=20):
  - Build ONE consolidated event: startsAt = registration open date, endsAt = registration close/last date.
  - If only one date is present, put it in startsAt and set endsAt = null.
  - NEVER create two separate events for registration.
  - actionLabel = "Apply Now" or "Register"

ADMIT_CARD (stageOrder=30):
  - startsAt = admit card release date
  - actionLabel = "Download Admit Card"

EXAM (stageOrder=40):
  - If exam spans multiple days, startsAt = first day, endsAt = last day.
  - For multi-shift exams, capture the date range.

ANSWER_KEY (stageOrder=50 for Phase 1, +100 per phase):
  - startsAt = answer key release date
  - actionLabel = "View Answer Key"
  *** OPTIONAL — Only include this event if the source text explicitly mentions answer key
      dates or answer key availability. If NO answer key data found, SKIP this stage entirely.
      Do NOT create a TBD placeholder for ANSWER_KEY. ***

RESULT (stageOrder=60):
  - startsAt = result declaration date
  - actionLabel = "Check Result"

DOCUMENT_VERIFICATION (stageOrder=70):
  - Capture dates if available, else TBD placeholder.

JOINING (stageOrder=80):
  - Capture joining/appointment dates if available, else TBD placeholder.

──────────────────────────────────────
RULE 4 — DATES
──────────────────────────────────────
- Use ISO8601 format: YYYY-MM-DDTHH:mm:ss.000Z
- If year is omitted in text, logically infer it using CURRENT_YEAR (${this.CURRENT_YEAR}).
  If the month is earlier than the current month and the context is upcoming, use CURRENT_YEAR+1.
- isTBD = true ONLY when text explicitly says "To be announced", "TBA", "Upcoming", "will be notified", etc.
- isTBD = true also when you are adding a mandatory placeholder for a missing stage.

──────────────────────────────────────
RULE 5 — MISSING / NULL DATA
──────────────────────────────────────
- Missing scalar fields → null (NOT "null" string, NOT "N/A").
- Missing array fields → [] (empty array).
- Never invent data that is not present in the source text.

──────────────────────────────────────
RULE 6 — ENUM VALIDATION (STRICT)
──────────────────────────────────────
- category: must be one of [${EXAM_CATEGORIES.join(', ')}]
- examLevel: must be one of [${EXAM_LEVELS.join(', ')}]
- stage: must be one of [${LIFECYCLE_STAGES.join(', ')}]

──────────────────────────────────────
RULE 7 — FORMATTING
──────────────────────────────────────
- aiConfidence: float 0.0–1.0 indicating extraction confidence.
- shortTitle: recognizable acronym/short name (e.g., "SSC CGL", "UPSC CSE").
- Markdown fields (applicationFee, qualificationCriteria, totalVacancies, salary, additionalDetails,
  description): use **bold**, - bullet points, ### headings to structure data neatly.

──────────────────────────────────────
RULE 8 — OFFICIAL LINKS ONLY
──────────────────────────────────────
Extract official website and notification URLs ONLY.
Exclude any third-party, affiliate, coaching, or news website links.

──────────────────────────────────────
STAGE ORDER REFERENCE TABLE
──────────────────────────────────────
Shared (all phases):  NOTIFICATION=10, REGISTRATION=20
Phase 1 (base):       ADMIT_CARD=30, EXAM=40, ANSWER_KEY=50(*), RESULT=60
Phase 2 (+100):       ADMIT_CARD=130, EXAM=140, ANSWER_KEY=150(*), RESULT=160
Phase 3 (+200):       ADMIT_CARD=230, EXAM=240, ANSWER_KEY=250(*), RESULT=260
(*) ANSWER_KEY: include only when source data is present — never insert as TBD.

═══════════════════════════════════════
SOURCE TEXT TO EXTRACT FROM:
═══════════════════════════════════════
${text}

═══════════════════════════════════════
OUTPUT: Return JSON MATCHING THIS EXACT SCHEMA (no extra keys, no markdown fences):
═══════════════════════════════════════
{
  "title": "string (Full official exam name)",
  "shortTitle": "string (e.g., SSC CGL) | null",
  "description": "string (markdown) | null",
  "conductingBody": "string | null",
  "category": "string (From Enum) | null",
  "examLevel": "string (NATIONAL|STATE|DISTRICT) | null",
  "state": "string (State name if applicable) | null",
  "examYear": "number | null",
  "age": "string (markdown, e.g., **18 - 32 years** as on 01.01.2024) | null",
  "totalVacancies": "string (markdown) | null",
  "applicationFee": "string (markdown) | null",
  "qualificationCriteria": "string (markdown) | null",
  "salary": "string (markdown) | null",
  "additionalDetails": "string (markdown) | null",
  "officialWebsite": "string (url) | null",
  "notificationUrl": "string (url) | null",
  "aiConfidence": "number (0.0 - 1.0)",
  "aiNotes": "string (your internal reasoning about completeness, multi-phase handling, TBD placeholders added) | null",
  "events": [
    {
      "stage": "string (From Enum: NOTIFICATION|REGISTRATION|ADMIT_CARD|EXAM|ANSWER_KEY|RESULT|DOCUMENT_VERIFICATION|JOINING)",
      "stageOrder": "number (see stage order table above, apply phase offset for multi-phase exams)",
      "title": "string (Descriptive event title, include phase/tier name for multi-phase exams)",
      "description": "string (markdown, include any relevant details, dates, shifts, centres) | null",
      "startsAt": "string (ISO8601) | null",
      "endsAt": "string (ISO8601) | null",
      "isTBD": "boolean (true if date is TBD or this is a mandatory placeholder)",
      "actionUrl": "string (url) | null",
      "actionLabel": "string (e.g. Apply Now, Download Admit Card, Check Result) | null"
    }
  ]
}`;
  }
}
