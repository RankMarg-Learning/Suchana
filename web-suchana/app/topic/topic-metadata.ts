import { Metadata } from 'next';
import { SeoPageCategory } from '../lib/enums';

interface TopicSeoData {
  title: string;
  description: string;
  keywords: string[];
}
const year = new Date().getFullYear();

export const TOPIC_SEO_CONFIG: Record<string, TopicSeoData> = {
  [SeoPageCategory.CURRENT_AFFAIRS]: {
    title: `Daily Current Affairs ${year}: Latest National & International Updates`,
    description: "Stay ahead with daily current affairs for government exams. Complete coverage of national news, international events, and critical GK for UPSC, SSC, and Banking.",
    keywords: [`current affairs ${year}`, "daily gk updates", "government exam news", "monthly current affairs pdf"]
  },
  [SeoPageCategory.BOOKS]: {
    title: `Best Books for Government Exams ${year}: Expert Recommendations`,
    description: "Discover the most highly-rated books and study materials for competitive exams. Curated list of textbooks, practice papers, and guides for top success.",
    keywords: ["best books for ssc", "upsc preparation books", "banking exam resources", `study material ${year}`]
  },
  [SeoPageCategory.SYLLABUS]: {
    title: `Latest Exam Syllabus ${year}: Topic-wise Breakdown & PDF`,
    description: "Get detailed, up-to-date syllabus for all major government exams. Includes exam patterns, subject-wise marking schemes, and downloadable PDFs.",
    keywords: ["exam syllabus ${year}", "topic wise syllabus", "ssc syllabus pdf", "upsc exam pattern"]
  },
  [SeoPageCategory.RESULT]: {
    title: `Latest Exam Results ${year}: Merit Lists & Scorecards`,
    description: "Check latest government exam results instantly. Instant access to merit lists, selection status, scorecards, and final selection updates.",
    keywords: [`exam results ${year}`, "sarkari result update", "merit list download", "check scorecard online"]
  },
  [SeoPageCategory.NOTIFICATION]: {
    title: `New Exam Notifications ${year}: Official Recruitment Updates`,
    description: "Direct links to latest official government exam notifications. Track new openings, application start dates, and recruitment PDF downloads.",
    keywords: ["new exam notifications", "recruitment ${year}", "latest sarkari jobs", "official notification pdf"]
  },
  [SeoPageCategory.ADMIT_CARD]: {
    title: `Exam Admit Card ${year}: Hall Ticket Download Links`,
    description: "Download your government exam admit cards easily. Direct links to hall tickets, exam city slips, and reporting instructions for all major exams.",
    keywords: ["admit card download", `hall ticket ${year}`, "exam city status", "call letter login"]
  },
  [SeoPageCategory.SALARY]: {
    title: `Salary & Job Profile ${year}: Pay Scales & Allowances`,
    description: "Detailed salary structures for government posts. Find information on pay scales, grade pay, HRA, DA, and career growth opportunities.",
    keywords: [`government salary ${year}`, "pay scale 7th cpc", "job profile details", "promotion hierarchy"]
  },
  [SeoPageCategory.PREVIOUS_YEAR_PAPER]: {
    title: "Previous Year Papers PDF: Download Question Papers",
    description: "Practice with actual government exam question papers from previous years. Free PDF downloads for SSC, Banking, Railway, and State exams.",
    keywords: ["previous year papers pdf", "solved question papers", "exam practice sets", "ssc old papers"]
  },
  [SeoPageCategory.ANSWER_KEY]: {
    title: `Exam Answer Key ${year}: Calculate Your Score`,
    description: "Access official exam answer keys and response sheets. Check correct answers, raise objections, and calculate your probable score.",
    keywords: ["official answer key", "calculate exam score", "raise objection link", "final answer key pdf"]
  },
  [SeoPageCategory.CUTOFF]: {
    title: `Previous & Expected Cut Off Marks ${year}`,
    description: "Analyze latest exam cutoff marks for all categories. Compare previous years' trends and check expert-predicted expected cutoffs.",
    keywords: ["exam cutoff marks", "previous year cutoff", "expected cutoff 2025", "category wise marks"]
  }
};

export function getMetadataForCategory(cat: SeoPageCategory, defaultLabel: string): Metadata {
  const config = TOPIC_SEO_CONFIG[cat];

  if (!config) {
    return {
      title: `${defaultLabel} - Exam Suchana`,
      description: `Stay updated with the latest ${defaultLabel.toLowerCase()} for your government exams preparation.`,
      keywords: ['government exams', defaultLabel.toLowerCase(), 'preparation', 'updates'],
    };
  }

  return {
    title: `${config.title} - Exam Suchana`,
    description: config.description,
    keywords: config.keywords,
    openGraph: {
      title: `${config.title} - Exam Suchana`,
      description: config.description,
      type: 'website',
    },
  };
}
