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
    console.log(prompt)
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

## ENUMS (strict — no other values accepted)
- Exam category: ${EXAM_CATEGORIES.join(' | ')}
- Exam status: ${EXAM_STATUSES.join(' | ')}
- Exam level: NATIONAL | STATE | DISTRICT
- Lifecyle stage: ${LIFECYCLE_STAGES.join(' | ')}

## RULES

**R0 - USE OF SOURCE DATA** :
- Try to use more source data for this data struture.

**R1 — STAGE EVENT BUILD** :
- Look about exam and source Important dates and urls to build events.
- Just look the source url and important dates and according to that build events. and sometime some stage available b/w two event but we  haven't url's and dates according to that stage then set isTBD:true, startsAt:null, endsAt:null, title:"<Stage> (To Be Announced)"
- Look Some Exam has more than 1 stage exam conducted create this flow by looking the important dates and urls e.g Tier I and Tier II (names of stage according to source)
- Don't Miss any stage if source has mention and Lifecycle Stage Enums has that stage then add it. and if not their detail will add close stage event description in proper
- According to Stage functionality if they have more link add this in stage description in md code, e.g([List I ](url1))

**R2 - STAGE ORDER** :
By looking exam process from internet and source dates set stageOrder. and make sure stageOrder is always increasing.(10,20,30..)


**R3 — DATES & RANGES (CRITICAL)**
- Format: ISO8601 (YYYY-MM-DDTHH:mm:ss.000Z)
- isTBD:true only if explicitly stated (TBA) or mandatory stage has no date. Month/Year only (e.g., "Nov 2025") -> set startsAt=1st of month.
- Start & End Dates: "Apply Start Date" and "Last Date" MUST map to \`startsAt\` and \`endsAt\` respectively of a SINGLE event (e.g., REGISTRATION).
- Date Ranges / Multiple Dates: For "22 - 23 Nov" or "06, 07, 13 & 14 Dec", set \`startsAt\` = First Date, \`endsAt\` = Last Date.
- Minor Dates: Fee payment, error correction, and application printing dates should be appended to the corresponding event (like REGISTRATION) description, do NOT create standalone events for them.


**R4 — MARKDOWN FIELDS**
- Use **bold** and - bullets  and md tables according to source data for: age, totalVacancies, applicationFee, qualificationCriteria, salary, additionalDetails, description.
- Keep values exactly as source text — only reformat, never invent.
- Markdown should be SEO-friendly.

**R5 — MISSING DATA**
- Missing scalar → null (not "null", not "N/A")
- Missing array → []
- Never invent data not present in source


**R6 — LOCAL EXAMS** (district/city level)
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
