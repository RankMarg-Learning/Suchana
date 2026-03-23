import OpenAI from 'openai';
import { logger } from '../../utils/logger';
import { env } from '../../config/env';
import { AiStructuredExam } from '../deduplication.service';
import {
  EXAM_CATEGORIES,
  EXAM_LEVELS,
  EXAM_STATUSES,
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
    return `You are an Indian government exam data extractor. Extract structured exam data from the source text.

HINT CATEGORY: ${hintCategory ?? 'auto-detect'}
CURRENT YEAR: ${this.CURRENT_YEAR}

## SCOPE
Only CENTRAL exams and STATE Grade-A exams.

## RULES

**R1 — MANDATORY STAGES** (always include, even without a date):
NOTIFICATION, REGISTRATION, ADMIT_CARD, EXAM, RESULT
→ If date is missing: set isTBD:true, startsAt:null, endsAt:null, title:"<Stage> (To Be Announced)"

**R2 — OPTIONAL STAGES** (include ONLY if explicitly mentioned in source):
ANSWER_KEY, DOCUMENT_VERIFICATION, JOINING
→ Never add TBD placeholders for these.

**R3 — EXAM PHASES & MULTIPLE POSTS**
Each phase (Prelims, Mains, Interview) and distinct post (e.g., Officer Scale-I, Office Assistant) gets its OWN set of events if dates differ.
NOTIFICATION and REGISTRATION are usually shared — create only ONE each unless explicitly separate.
Label all events with the phase/post name in the title (e.g., "Office Assistant Pre Exam", "Officer Scale-I Admit Card").
Assign stageOrder strictly by chronological date.

Example chronological order:
10=Notification, 20=Registration, 30=Pre Admit Card (Assistant), 40=Pre Exam (Assistant),
50=Pre Admit Card (Scale-I), 60=Pre Exam (Scale-I), 70=Pre Result (Assistant), ...

**R4 — DATES & RANGES (CRITICAL)**
- Format: ISO8601 (YYYY-MM-DDTHH:mm:ss.000Z)
- Missing year → use CURRENT_YEAR; if month already passed and context is future → CURRENT_YEAR+1
- isTBD:true only if explicitly stated (TBA) or mandatory stage has no date. Month/Year only (e.g., "Nov 2025") -> set startsAt=1st of month.
- Start & End Dates: "Apply Start Date" and "Last Date" MUST map to \`startsAt\` and \`endsAt\` respectively of a SINGLE event (e.g., REGISTRATION).
- Date Ranges / Multiple Dates: For "22 - 23 Nov" or "06, 07, 13 & 14 Dec", set \`startsAt\` = First Date, \`endsAt\` = Last Date.
- Minor Dates: Fee payment, error correction, and application printing dates should be appended to the corresponding event (like REGISTRATION) description, do NOT create standalone events for them.

**R5 — ENUMS** (strict — no other values accepted)
- category: ${EXAM_CATEGORIES.join(' | ')}
- status: ${EXAM_STATUSES.join(' | ')}
- examLevel: NATIONAL | STATE | DISTRICT
- stage: ${LIFECYCLE_STAGES.join(' | ')}

**R6 — MARKDOWN FIELDS**
Use **bold** and - bullets for: age, totalVacancies, applicationFee, qualificationCriteria, salary, additionalDetails, description.
Keep values exactly as source text — only reformat, never invent.

**R7 — MISSING DATA**
- Missing scalar → null (not "null", not "N/A")
- Missing array → []
- Never invent data not present in source

**R8 — LINKS**
Extract official URLs only. No third-party, coaching, or news site links.

**R9 — LOCAL EXAMS** (district/city level)
Omit state field. Include only NOTIFICATION and REGISTRATION events.

---

SOURCE TEXT:
${text}

---

OUTPUT: Return only valid JSON — no markdown fences, no extra keys.

{
  "title": "string",
  "shortTitle": "string|null",
  "description": "string (markdown, SEO-friendly)|null",
  "conductingBody": "string|null",
  "category": "enum|null",
  "status": "enum|null",
  "examLevel": "NATIONAL|STATE|DISTRICT|null",
  "state": "string|null (if exam is state level, then state is required)",
  "examYear": "number|null",
  "age": "string (markdown)|null",
  "totalVacancies": "string (markdown)|null",
  "applicationFee": "string (markdown)|null",
  "qualificationCriteria": "string (markdown)|null",
  "salary": "string (markdown)|null",
  "additionalDetails": "string (markdown, FAQs)|null",
  "officialWebsite": "string (url)|null",
  "notificationUrl": "string (url)|null",
  "aiConfidence": "number (0.0–1.0)",
  "aiNotes": null,
  "events": [
    {
      "stage": "enum",
      "stageOrder": "number",
      "title": "string",
      "description": "string (SEO)",
      "startsAt": "ISO8601|null",
      "endsAt": "ISO8601|null",
      "isTBD": "boolean",
      "actionUrl": "string|null",
      "actionLabel": "string|null"
    }
  ]
}`;
  }
}
