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
1. Dates: Use ISO8601 format (YYYY-MM-DDTHH:mm:ss.000Z). If the year is omitted in the text, logically infer it using CURRENT_YEAR (${this.CURRENT_YEAR}).
2. Missing Data: If a field is not found or not applicable, return null (the JSON null value, NOT a string "null" or "N/A"), except for arrays which should be empty [].
3. isTBD: Set to true ONLY if a date is explicitly mentioned as "To be announced", "Upcoming", or similar.
4. isImportant: Set to true for START and RELEASE event types, especially for REGISTRATION, EXAM, and RESULT stages.
5. Allowed Enum Values (Strict Validation):
   - category: Must be one of [${EXAM_CATEGORIES.join(', ')}]
   - examLevel: Must be one of [${EXAM_LEVELS.join(', ')}]
   - stage: Must be one of [${LIFECYCLE_STAGES.join(', ')}]
   - eventType: Must be one of [${LIFECYCLE_EVENT_TYPES.join(', ')}]
6. Data formatting requirements:
   - aiConfidence: A float between 0.0 and 1.0 indicating your confidence in the extracted data.
   - shortTitle: Provide a recognizable acronym or short name (e.g., 'SSC CGL', 'UPSC CSE').
   - Markdown fields (applicationFee, qualificationCriteria, totalVacancies, salary, additionalDetails, description): Extensively use Markdown (like '**bold**', '- bullet points', '### headings') to properly structure and neatly present the data.
7. Official Links: Extract official website and notification URLs ONLY. Exclude any third-party, affiliate, or spam links.
8. REGISTRATION Consolidation: For the REGISTRATION stage, strictly build only ONE event that contains both startsAt (opening date) and endsAt (deadline). Use eventType "START" for this consolidated event. Do not create separate "START" and "END" events.

STAGE ORDER GUIDELINE:
NOTIFICATION=10, REGISTRATION=20, ADMIT_CARD=30, EXAM=40, ANSWER_KEY=50, RESULT=60, DOCUMENT_VERIFICATION=70, JOINING=80

TEXT:
---
${text}
---

Return JSON MATCHING THIS EXACT SCHEMA:
{
  "title": "string (Full official exam name)",
  "shortTitle": "string (e.g., SSC CGL) | null",
  "description": "string (markdown) | null",
  "conductingBody": "string | null",
  "category": "string (From Enum) | null",
  "examLevel": "string (NATIONAL|STATE|DISTRICT) | null",
  "state": "string (State name if applicable) | null",
  "examYear": "number | null",
  "minAge": "number | null",
  "maxAge": "number | null",
  "totalVacancies": "string (markdown) | null",
  "applicationFee": "string (markdown) | null",
  "qualificationCriteria": "string (markdown) | null",
  "salary": "string (markdown) | null",
  "additionalDetails": "string (markdown) | null",
  "officialWebsite": "string (url) | null",
  "notificationUrl": "string (url) | null",
  "aiConfidence": "number (0.0 - 1.0)",
  "aiNotes": "string (internal reasoning) | null",
  "events": [
    {
      "stage": "string (From Enum)",
      "eventType": "string (From Enum)",
      "stageOrder": "number",
      "title": "string (Event title)",
      "description": "string (markdown) | null",
      "startsAt": "string (ISO8601) | null",
      "endsAt": "string (ISO8601) | null",
      "isTBD": "boolean",
      "isImportant": "boolean",
      "actionUrl": "string (url) | null",
      "actionLabel": "string | null"
    }
  ]
}`;
    }
}
