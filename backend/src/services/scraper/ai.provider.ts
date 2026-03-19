import OpenAI from 'openai';
import { logger } from '../../utils/logger';
import { env } from '../../config/env';
import { AiStructuredExam } from '../deduplication.service';
import {
    EXAM_CATEGORIES,
    EXAM_LEVELS,
    LIFECYCLE_STAGES,
    LIFECYCLE_EVENT_TYPES,
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
                max_tokens: 2000,
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

SOURCE URL: ${sourceUrl}
HINT CATEGORY: ${hintCategory ?? 'auto-detect'}
CURRENT YEAR: ${this.CURRENT_YEAR}

RULES:
1. Dates: ISO8601 format (YYYY-MM-DDTHH:mm:ss.000Z). Infer year from context using ${this.CURRENT_YEAR}.
2. isTBD: true ONLY if date is explicitly "To be announced".
3. isImportant: true for APPLICATION_START, APPLICATION_END, EXAM_DATE, RESULT.
4. Allowed Enum Values:
   - category: ${EXAM_CATEGORIES.join(', ')}
   - examLevel: ${EXAM_LEVELS.join(', ')}
   - stage: ${LIFECYCLE_STAGES.join(', ')}
   - eventType: ${LIFECYCLE_EVENT_TYPES.join(', ')}
5. Data types:
   - aiConfidence: float 0.0–1.0.
   - applicationFee: Descriptive string summarizing application fees (format as Markdown).
   - qualificationCriteria: Descriptive string summarizing required qualifications (format as Markdown).
   - totalVacancies: Descriptive string summarizing vacancy details or exact count (format as Markdown).
   - salary: Descriptive string outlining the pay scale or salary (format as Markdown).
   - additionalDetails: Any other extra important details (format as Markdown).
   - description: add info which is not present in any other field but important, formatted as Markdown.
6. Use Markdown ('**bold**', '- bullet points', '### headings') to properly structure the string values to make them readable.
7. Official links only. No third-party ads/spam links.

STAGE ORDER GUIDELINE:
NOTIFICATION=10, REGISTRATION=20, ADMIT_CARD=30, EXAM=40, ANSWER_KEY=50, RESULT=60, DV=70, JOINING=80

TEXT:
---
${text}
---

Return JSON:
{
  "title": "string",
  "shortTitle": "string",
  "description": "add info which is not present in any other field but important with markdown format",
  "conductingBody": "string",
  "category": "ENUM",
  "examLevel": "NATIONAL|STATE|DISTRICT",
  "state": "string|null",
  "examYear": number,
  "minAge": number,
  "maxAge": number,
  "totalVacancies": "string",
  "applicationFee": "string",
  "qualificationCriteria": "string",
  "salary": "string",
  "additionalDetails": "string",
  "officialWebsite": "url",
  "notificationUrl": "official website url",
  "aiConfidence": number,
  "aiNotes": "string",
  "events": [
    {
      "stage": "ENUM",
      "eventType": "ENUM",
      "stageOrder": number,
      "title": "string",
      "description": "important not about event",
      "startsAt": "ISO",
      "endsAt": "ISO",
      "isTBD": boolean,
      "isImportant": boolean,
      "actionUrl": "url",
      "actionLabel": "string"
    }
  ]
}`;
    }
}
