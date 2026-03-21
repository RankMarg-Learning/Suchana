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
        model: 'gpt-4o-mini',
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
RULE 1 - FOR EXAM IDENTIFY THE TIMELINE OF THE EXAM (ONLY CENTERAL EXAM & STATE GRADE A EXAMS)
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

RULE 3 — MULTI-PHASE EXAM HANDLING
If the exam has multiple distinct phases, tiers, or papers (e.g.,
Prelims and Mains, Paper 1 and Paper 2), EACH phase MUST produce its OWN separate set
of events. Never merge dates from different phases into a single event.

NOTIFICATION (stageOrder=10) and REGISTRATION (stageOrder=20) are shared for the whole exam.
Create only ONE notification event and ONE registration event regardless of the number of phases.

For each individual phase, create SEPARATE events for:
  ✓ ADMIT_CARD  (one per phase, labeled "(Exam 1 Name) Admit Card", "(Exam 2 Name) Admit Card", etc.)
  ✓ EXAM        (one per phase — NEVER merge (Exam 1 Name) and (Exam 2 Name) into one EXAM event)
  ✓ ANSWER_KEY  (one per phase, only if answer key data is found for that phase)
  ✓ RESULT      (one per phase, labeled "(Exam 1 Name) Result", "(Exam 2 Name) Result", etc.)

Example for SSC CGL (2-tier):
  stageOrder=10  → Notification Release
  stageOrder=20  → Application Form Window
  stageOrder=30  → Prelims Admit Card
  stageOrder=40  → Prelims Exam (with date range if multi-day)
  stageOrder=50  → Prelims Answer Key — only if data present
  stageOrder=60  → Prelims Result
... (continue this pattern for all phases)

Label each event title with the phase name to prevent ambiguity.

RULE 4 — PER-STAGE EXTRACTION GUIDE (NOTE: IF SOURCE DIDN'T HAVE ANY DATE ABOUT NOTIFICATION DON'T ADD and FOR LOCAL EXAM DON'T ADD STATE, JUST ADD NOTIFICATION & REGISTRATION)

RULE 5 — DATES:
- Format: ISO8601 (YYYY-MM-DDTHH:mm:ss.000Z)

- Year handling:
  • If missing → use CURRENT_YEAR (${this.CURRENT_YEAR})
  • If month < current month AND context = future → use CURRENT_YEAR+1

- isTBD:
  • true → only if explicitly mentioned (TBA, Upcoming, will be notified, etc.)
  • true → also for mandatory placeholder stages with no date

RULE 6 — MISSING / NULL DATA
- Missing scalar fields → null (NOT "null" string, NOT "N/A").
- Missing array fields → [] (empty array).
- Never invent data that is not present in the source text.

RULE 7 — ENUM VALIDATION (STRICT)
- category: must be one of [${EXAM_CATEGORIES.join(', ')}]
- examLevel: must be one of [${EXAM_LEVELS.join(', ')}]
- stage: must be one of [${LIFECYCLE_STAGES.join(', ')}]

RULE 7 — FORMATTING
- Markdown fields (applicationFee, qualificationCriteria, totalVacancies, salary, additionalDetails,
  description): use **bold**, - bullet points, ### headings to structure data neatly.

RULE 8 — OFFICIAL LINKS ONLY
Extract official website and notification URLs ONLY.
Exclude any third-party, affiliate, coaching, or news website links.


SOURCE TEXT TO EXTRACT FROM:
${text}

OUTPUT: Return JSON MATCHING THIS EXACT SCHEMA (no extra keys, no markdown fences):
{
  "title": "string (Full official exam name)",
  "shortTitle": "string (e.g., SSC CGL) | null",
  "description": "string (markdown) | null : (NOTE: add seo friendly description)",
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
  "aiNotes": null,
  "events": [
    {
      "stage": "string (From LIFECYCLE_STAGES Enum)",
      "stageOrder": "number",
      "title": "string",
      "description": "string (seo description)",
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
