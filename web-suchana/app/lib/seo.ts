import { ExamStatus } from "./enums";
import { Exam, stripMarkdown } from "./types";


export function generateSeoTitle(exam: Exam, type: ExamStatus | string): string {
  const base = exam.shortTitle || exam.title;
  const yearMatch = base.match(/\b(20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
  const name = base.replace(/\b20\d{2}\b/, '').replace(/\s+/g, ' ').trim();
  const recruitmentLabel = name.toLowerCase().includes('recruitment') ? '' : ' Recruitment';

  const yearStr = ` ${year}`;

  switch (type) {
    case ExamStatus.REGISTRATION_OPEN:
      return `${name}${recruitmentLabel}${yearStr} — Apply Online, Check Details`;
    case ExamStatus.RESULT_DECLARED:
      return `${name} Result${yearStr} OUT — Check Scorecard`;
    case ExamStatus.ADMIT_CARD_OUT:
      return `${name} Admit Card${yearStr} OUT — Download Link`;
    case ExamStatus.ANSWER_KEY_OUT:
      return `${name} Answer Key${yearStr} OUT — Check/Download`;
    case ExamStatus.NOTIFICATION:
      return `${name} Notification PDF${yearStr} — Key Dates & Details`;
    default:
      return `${name}${recruitmentLabel}${yearStr} — Details, Dates & Result`;
  }
}

export function generateSeoDescription(exam: Exam, type: ExamStatus | string): string {
  const base = exam.shortTitle || exam.title;
  const yearMatch = base.match(/\b(20\d{2})\b/);
  const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
  const name = base.replace(/\b20\d{2}\b/, '').replace(/\s+/g, ' ').trim();
  const recruitmentLabel = name.toLowerCase().includes('recruitment') ? '' : ' Recruitment';

  const displayTitle = `${name}${recruitmentLabel} ${year}`.trim();
  const body = exam.conductingBody;
  const vacancies = exam.totalVacancies && exam.totalVacancies !== "TBA" ? ` with ${exam.totalVacancies} vacancies.` : ".";

  switch (type) {
    case ExamStatus.REGISTRATION_OPEN:
      return `Apply for ${displayTitle} by ${body} ${stripMarkdown(vacancies)} Check eligibility criteria, age limit, and salary. Get the direct application link and official notification PDF.`;
    case ExamStatus.RESULT_DECLARED:
      return `${name} Result ${year} is officially OUT. Download the merit list and check category-wise cut off marks declared by ${body}. Direct official links to check result inside.`;
    case ExamStatus.ADMIT_CARD_OUT:
      return `Download your ${name} Admit Card ${year} for the upcoming ${body} exam. Check your exam center, reporting time, and important instructions. Official download link available.`;
    case ExamStatus.ANSWER_KEY_OUT:
      return `Detailed ${name} Answer Key ${year} and latest Exam Pattern. Download the official PDF for ${body} selection process, marking scheme, and subject-wise topics for preparation.`;
    case ExamStatus.NOTIFICATION:
      return `${displayTitle} Official Notification PDF is available now. Check detailed eligibility, important dates, and ${stripMarkdown(vacancies)} vacancies announced by ${body}.`;
    default:
      return `Get real-time updates for ${displayTitle} by ${body}. Check application status, syllabus, admit card, and result dates on Exam Suchana — the fastest update portal.`;
  }
}
