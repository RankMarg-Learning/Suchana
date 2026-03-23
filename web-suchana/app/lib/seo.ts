import { Exam, STATUS_LABELS, cleanLabel } from "./types";

export type SeoType = "JOB" | "RESULT" | "ADMIT_CARD" | "SYLLABUS" | "SALARY" | "CUTOFF";

export function generateSeoTitle(exam: Exam, type: SeoType): string {
  const year = new Date().getFullYear();
  const title = exam.shortTitle || exam.title;
  const vacancies = exam.totalVacancies && exam.totalVacancies !== "TBA" ? ` (${exam.totalVacancies} Posts)` : "";

  switch (type) {
    case "JOB":
      return `${title} Recruitment ${year} Notification OUT — Apply Online Now${vacancies}`;
    case "RESULT":
      return `${title} Result ${year} Declared — Check Merit List & Score Card`;
    case "ADMIT_CARD":
      return `${title} Admit Card ${year} Download Link — Hall Ticket Released`;
    case "SYLLABUS":
      return `${title} Syllabus ${year} PDF Download — Exam Pattern & Selection Process`;
    case "SALARY":
      return `${title} Salary ${year} — Job Profile, Pay Scale & Allowances`;
    case "CUTOFF":
      return `${title} Cut Off 2025-26 — Expected & Previous Year Cutoff Marks`;
    default:
      return `${title} Recruitment ${year} — Latest Updates & Notification`;
  }
}

export function generateSeoDescription(exam: Exam, type: SeoType): string {
  const title = exam.shortTitle || exam.title;
  const body = exam.conductingBody;
  
  switch (type) {
    case "JOB":
      return `Apply online for ${title} Recruitment ${year()} announced by ${body}. Get full details on eligibility, total vacancies${exam.totalVacancies ? ` (${exam.totalVacancies})` : ""}, important dates, and how to apply.`;
    case "RESULT":
      return `${title} Result ${year()} has been declared by ${body}. Direct link to check your result, merit list, and selection status. Check ${title} score card here.`;
    case "ADMIT_CARD":
      return `Download ${title} Admit Card ${year()} for ${body} examination. Direct official link to download hall ticket and check exam center instructions.`;
    case "SYLLABUS":
      return `Check updated ${title} Syllabus ${year()} and Exam Pattern. Download PDF for ${body} selection process, marking scheme, and subject-wise topics.`;
    case "SALARY":
      return `What is the salary of ${title}? Check latest pay scale, in-hand salary, allowances, and career growth for ${title} recruitment by ${body}.`;
    case "CUTOFF":
      return `${title} Expected Cut Off Marks ${year()} and last year's official cutoff. Category-wise cutoff for UR, OBC, SC, ST, and EWS candidates.`;
    default:
      return `Latest updates and real-time notification for ${title} by ${body}. Check all details on one page.`;
  }
}

function year() {
    return new Date().getFullYear();
}
