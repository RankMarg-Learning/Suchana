import { ExamStatus } from "./enums";
import { Exam, stripMarkdown } from "./types";


export function generateSeoTitle(exam: Exam, type: ExamStatus | string): string {
  const currentYear = new Date().getFullYear();
  const title = exam.title;

  const hasYear = /202\d/.test(title);
  const yearPart = hasYear ? "" : ` ${currentYear}`;

  let baseTitle = "";
  switch (type) {
    case ExamStatus.REGISTRATION_OPEN:
      baseTitle = `${title} ${yearPart} — Apply Online, Check Details`;
      break;
    case ExamStatus.RESULT_DECLARED:
      baseTitle = `${title} ${yearPart} Result (Released) — Check Result`;
      break;
    case ExamStatus.ADMIT_CARD_OUT:
      baseTitle = `${title} Admit Card ${yearPart} OUT — Download Admit Card`;
      break;
    case ExamStatus.ANSWER_KEY_OUT:
      baseTitle = `${title} Answer Key ${yearPart} OUT — Direct Download Link`;
      break;
    case ExamStatus.NOTIFICATION:
      baseTitle = `${title} Official Notification PDF — Key Dates & Details`;
      break;
    default:
      baseTitle = `${title}${yearPart}: Apply Online, Dates & Result Status`;
  }

  return `${baseTitle}`;
}

export function generateSeoDescription(exam: Exam, type: ExamStatus | string): string {
  const currentYear = new Date().getFullYear();
  const title = exam.shortTitle || exam.title;
  const hasYear = /202\d/.test(title);
  const yearStr = hasYear ? "" : ` ${currentYear}`;

  const body = exam.conductingBody;
  const vacancies = exam.totalVacancies && exam.totalVacancies !== "TBA" ? ` with ${exam.totalVacancies} vacancies.` : ".";

  switch (type) {
    case ExamStatus.REGISTRATION_OPEN:
      return `Apply for ${title} Recruitment ${yearStr} by ${body} ${stripMarkdown(vacancies)} Check eligibility criteria, age limit, and salary. Get the direct application link and official notification PDF.`;
    case ExamStatus.RESULT_DECLARED:
      return `${title} Result${yearStr} is officially OUT. Download the merit list and check category-wise cut off marks declared by ${body}. Direct official links to check result inside.`;
    case ExamStatus.ADMIT_CARD_OUT:
      return `Download your ${title} Admit Card ${yearStr} for the upcoming ${body} exam. Check your exam center, reporting time, and important instructions. Official download link available.`;
    case ExamStatus.ANSWER_KEY_OUT:
      return `Detailed ${title} Answer Key ${yearStr} and latest Exam Pattern. Download the official PDF for ${body} selection process, marking scheme, and subject-wise topics for preparation.`;
    case ExamStatus.NOTIFICATION:
      return `${title} Official Notification PDF is available now. Check detailed eligibility, important dates, and ${stripMarkdown(vacancies)} vacancies announced by ${body}.`;
    default:
      return `Get real-time updates for ${title}${yearStr} recruitment by ${body}. Check application status, syllabus, admit card, and result dates on Exam Suchana — the fastest update portal.`;
  }
}
