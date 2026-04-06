import { Exam, stripMarkdown } from "./types";

export type SeoType = "JOB" | "RESULT" | "ADMIT_CARD" | "SYLLABUS" | "SALARY" | "CUTOFF";

export function generateSeoTitle(exam: Exam, type: SeoType | string): string {
  const currentYear = new Date().getFullYear();
  const title = exam.title;

  const hasYear = /202\d/.test(title);
  const yearPart = hasYear ? "" : ` ${currentYear}`;

  let baseTitle = "";
  switch (type) {
    case "REGISTRATION_OPEN":
    case "JOB":
      baseTitle = `${title} Recruitment${yearPart} — Apply Online, Check Details`;
      break;
    case "RESULT_DECLARED":
    case "RESULT":
      baseTitle = `${title} Result${yearPart} (Released) — Download Merit List`;
      break;
    case "ADMIT_CARD_OUT":
    case "ADMIT_CARD":
      baseTitle = `${title} Admit Card${yearPart} OUT — Direct Download Link`;
      break;
    case "SYLLABUS":
      baseTitle = `${title} Syllabus${yearPart} PDF — Exam Pattern & Selection`;
      break;
    case "SALARY":
      baseTitle = `${title} Salary${yearPart} — Pay Scale & Monthly In-hand`;
      break;
    case "CUTOFF":
      baseTitle = `${title} Cut Off Marks — Expected & Previous Year`;
      break;
    case "NOTIFICATION":
      baseTitle = `${title} Official Notification PDF — Key Dates & Details`;
      break;
    default:
      baseTitle = `${title}${yearPart}: Apply Online, Dates & Result Status`;
  }

  return `${baseTitle}`;
}

export function generateSeoDescription(exam: Exam, type: SeoType | string): string {
  const currentYear = new Date().getFullYear();
  const title = exam.shortTitle || exam.title;
  const hasYear = /202\d/.test(title);
  const yearStr = hasYear ? "" : ` ${currentYear}`;

  const body = exam.conductingBody;
  const vacancies = exam.totalVacancies && exam.totalVacancies !== "TBA" ? ` with ${exam.totalVacancies} vacancies.` : ".";

  switch (type) {
    case "REGISTRATION_OPEN":
    case "JOB":
      return `Apply for ${title} Recruitment${yearStr} by ${body}${stripMarkdown(vacancies)} Check eligibility criteria, age limit, and salary. Get the direct application link and official notification PDF.`;
    case "RESULT_DECLARED":
    case "RESULT":
      return `${title} Result${yearStr} is officially OUT. Download the merit list and check category-wise cut off marks declared by ${body}. Direct official links to check result inside.`;
    case "ADMIT_CARD_OUT":
    case "ADMIT_CARD":
      return `Download your ${title} Admit Card${yearStr} for the upcoming ${body} exam. Check your exam center, reporting time, and important instructions. Official download link available.`;
    case "SYLLABUS":
      return `Detailed ${title} Syllabus${yearStr} and latest Exam Pattern. Download the official PDF for ${body} selection process, marking scheme, and subject-wise topics for preparation.`;
    case "SALARY":
      return `What is the salary for ${title}? Check latest 7th Pay Commission pay scale, allowances, and monthly in-hand salary for ${title} recruitment by ${body}.`;
    case "CUTOFF":
      return `${title} Expected Cut Off Marks and official previous year cutoff data for UR, OBC, SC, ST, and EWS candidates. Check ${body} selection benchmarks here.`;
    case "NOTIFICATION":
      return `${title} Official Notification PDF is available now. Check detailed eligibility, important dates, and ${stripMarkdown(vacancies)} vacancies announced by ${body}.`;
    default:
      return `Get real-time updates for ${title}${yearStr} recruitment by ${body}. Check application status, syllabus, admit card, and result dates on Exam Suchana — the fastest update portal.`;
  }
}
