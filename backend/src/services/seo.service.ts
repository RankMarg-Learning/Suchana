import prisma from '../config/database';
import { logger } from '../utils/logger';

export class SeoService {
  /**
   * Generates a comprehensive suite of SEO pages for a single exam
   * Covers notification, vacancies, eligibility, salary, syllabus, and every lifecycle stage
   */
  static async generateExamSeoPages(examId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { lifecycleEvents: true }
    });

    if (!exam) return;

    const year = new Date().getFullYear();
    const nextYear = year + 1;
    const baseSlug = exam.slug;
    const examName = exam.shortTitle || exam.title;
    const body = exam.conductingBody || 'Government';

    const wrap = (val: string | null | undefined, fallback: string = 'Check official notification') => val || fallback;

    const pageConfigs: any[] = [
      {
        category: 'NOTIFICATION',
        slug: `${baseSlug}-notification-pdf`,
        title: `${examName} Notification PDF Download — ${year} Link`,
        metaTitle: `${examName} Recruitment 2026 Notification OUT — Apply Now ${wrap(exam.totalVacancies) !== 'TBA' ? `(${exam.totalVacancies} Posts)` : ''}`,
        metaDescription: `Download the official ${examName} notification PDF. Check important dates, vacancies, and eligibility details for ${body} ${examName} recruitment.`,
        content: `
# ${examName} Official Notification PDF
Looking for the ${examName} official notification? The ${body} has released the detailed advertisement for the current cycle.

## Key Highlights
- **Organization**: ${body}
- **Exam Name**: ${examName}
- **Official Website**: ${wrap(exam.officialWebsite)}

## How to Download Notification
1. Visit ${wrap(exam.officialWebsite)}.
2. Search for "${examName} Official Ad".
3. Download the PDF for future reference.
        `
      },
      {
        category: 'VACANCIES',
        slug: `${baseSlug}-vacancy-details`,
        title: `${examName} Vacancy Details ${year}-${nextYear} — Category Wise`,
        metaTitle: `${examName} Vacancy ${year}: Check Category-wise Post Details ${wrap(exam.totalVacancies) !== 'TBA' ? `(${exam.totalVacancies} Posts)` : ''}`,
        metaDescription: `Check total ${examName} vacancies for the ${year} cycle. Breakdown of posts for UR, OBC, SC, ST, and EWS categories for ${examName}.`,
        content: `
# ${examName} Vacancy Details ${year}
The total number of vacancies for ${examName} is a crucial factor in determining your chances of selection.

## Total Vacancies
The ${body} has announced **${wrap(exam.totalVacancies, 'multiple')}** vacancies for various posts.

## Category-wise Breakdown
Candidates are advised to check the official vertical and horizontal reservation data in the notification PDF. Usually, the vacancies are split across:
- Unreserved (UR)
- Other Backward Classes (OBC)
- Scheduled Castes (SC) / Scheduled Tribes (ST)
- Economically Weaker Section (EWS)
        `
      },
      {
        category: 'ELIGIBILITY',
        slug: `${baseSlug}-eligibility-criteria`,
        title: `${examName} Eligibility Criteria: Age & Qualification`,
        metaTitle: `${examName} Eligibility ${year}: Age Limit, Qualification & Degree`,
        metaDescription: `Detailed ${examName} eligibility criteria. Check minimum educational qualification, age limit, and relaxation for reserved categories.`,
        content: `
# ${examName} Eligibility Criteria
Before applying for ${examName}, ensure you meet all the eligibility parameters set by ${body}.

## Educational Qualification
**Requirement**: ${wrap(exam.qualificationCriteria)}

## Age Limit
**Criteria**: ${wrap(exam.age, 'Refer to official notification')}
*Age relaxation applies for OBC (3 years), SC/ST (5 years), and PwD candidates as per government norms.*
        `
      },
      {
        category: 'SALARY',
        slug: `${baseSlug}-salary-job-profile`,
        title: `${examName} Salary and Job Profile`,
        metaTitle: `${examName} Salary ${year}: Pay Scale, In-hand Salary & Benefits`,
        metaDescription: `Check ${examName} salary structure, pay level, basic pay, HRA, DA, and other allowances. Also explore the career growth and job profile.`,
        content: `
# ${examName} Salary Structure
The salary for ${examName} posts is governed by the ${exam.examLevel === 'NATIONAL' ? '7th Pay Commission' : 'State Pay Commission'}.

## Pay Scale Details
- **Current Salary Estimate**: ${wrap(exam.salary)}
- **Allowances**: DA, HRA, Transport Allowance, and Medical Benefits.

## Job Responsibilities
Candidates selected for ${examName} will be responsible for ${wrap(exam.description, 'administrative and operational duties')} within the department.
        `
      },
      {
        category: 'SYLLABUS',
        slug: `${baseSlug}-syllabus-exam-pattern`,
        title: `${examName} Syllabus & Exam Pattern`,
        metaTitle: `${examName} Syllabus PDF: Check Subject-wise Exam Pattern`,
        metaDescription: `Get the detailed ${examName} syllabus for all stages. Download subject-wise PDF and check marking scheme, duration, and negative marking.`,
        content: `
# ${examName} Syllabus & Exam Pattern
Understanding the ${examName} syllabus is the first step towards success.

## Exam Pattern Overview
- **Mode**: Online/Offline
- **Type**: Objective / Descriptive
- **Marking**: Check for negative marking rules in the official guide.

## Subjects Covered
Typically includes General Intelligence, Reasoning, Quantitative Aptitude, English/Hindi language, and General Awareness.
        `
      },
      {
        category: 'SELECTION_PROCESS',
        slug: `${baseSlug}-selection-process`,
        title: `${examName} Selection Process Overview`,
        metaTitle: `${examName} Selection Process: Stages from Tier 1 to Final Merit`,
        metaDescription: `Comprehensive guide to ${examName} selection process. Details on Prelims, Mains, Interview, Physical Test, and Document Verification.`,
        content: `
# ${examName} Selection Process
The ${examName} recruitment involves multiple stages to filter the best candidates.

## Stages of Selection
1. **Stage 1**: Preliminary Examination
2. **Stage 2**: Main Examination / Skill Test
3. **Stage 3**: Document Verification (DV)
4. **Final Step**: Medical Examination and Merit List
        `
      },
      {
        category: 'ADMIT_CARD',
        slug: `${baseSlug}-admit-card`,
        title: `${examName} Admit Card Download Link — Hall Ticket Released`,
        metaTitle: `${examName} Admit Card ${year}: Direct Download Link OUT`,
        metaDescription: `Find the official ${examName} admit card download link. Steps to retrieve password and reporting time instructions for the exam day.`,
        content: `
# ${examName} Admit Card
Your hall ticket for ${examName} is now available or releasing soon on the ${body} portal.

## How to Download
1. Visit **${wrap(exam.officialWebsite)}**.
2. Click on "Download Admit Card for ${examName}".
3. Enter Application No. and Password.
        `
      },
      {
        category: 'RESULTS',
        slug: `${baseSlug}-result`,
        title: `${examName} Result & Merit List PDF — Check Status`,
        metaTitle: `${examName} Result ${year} DECLARED: Check Scorecard and Merit List`,
        metaDescription: `Check your ${examName} result and download the merit list PDF. Find category-wise cut-off and steps to check the scorecard.`,
        content: `
# ${examName} Result
The results for ${examName} are officially declared after the exam cycle concludes.

## Steps to Check Result
- Visit the official portal.
- Find the "Results" tab.
- Look for ${examName} recruitment link.
        `
      },
      {
        category: 'CUT_OFF',
        slug: `${baseSlug}-cut-off-marks`,
        title: `${examName} Cut Off Marks & Previous Trends`,
        metaTitle: `${examName} Cut Off ${year}: Expected vs Previous Year Cut-off Marks`,
        metaDescription: `Analyze ${examName} cut-off trends. Check expected cut-off for the current year and category-wise marks for UR, OBC, SC, ST.`,
        content: `
# ${examName} Cut Off Marks
The cut-off is the minimum score required to qualify for the next stage of ${examName}.

## Factors Affecting Cut-off
- Difficulty level of the paper.
- Number of vacancies available.
- Total number of candidates who appeared.
        `
      },
      {
        category: 'ANSWER_KEY',
        slug: `${baseSlug}-answer-key`,
        title: `${examName} Answer Key & Objection Link`,
        metaTitle: `${examName} Answer Key ${year}: Download PDF and Raise Objections`,
        metaDescription: `Download the ${examName} provisional answer key. Direct link to check responses and procedure to challenge incorrect answers.`,
        content: `
# ${examName} Answer Key
Check your estimated score using the official ${examName} answer key.

## Objection Window
If you find any discrepancies, follow the official portal instructions to "Raise Objections" within the specified timeframe.
        `
      }
    ];


    for (const event of exam.lifecycleEvents) {
      const stageSlug = event.stage.replace(/[\s_]+/g, '-').toLowerCase();

      pageConfigs.push({
        category: 'STAGES',
        slug: `${baseSlug}-${stageSlug}-updates`,
        title: `${examName} ${event.stage} Updates`,
        metaTitle: `${examName} ${event.stage}: Check Important Dates & Instructions`,
        metaDescription: `Get the latest updates for the ${event.stage} of ${examName} recruitment. Important dates, links, and detailed information for candidates.`,
        content: `
# ${examName} ${event.stage}
This page covers the latest information regarding the **${event.stage}** of the ${examName} examination.

## Details
- **Description**: ${wrap(event.description)}
- **Action Link**: ${wrap(event.actionUrl, 'Check Official Portal')}

Stay connected for real-time updates on this stage.
            `
      });
    }

    for (const config of pageConfigs) {
      try {
        await prisma.seoPage.upsert({
          where: { slug: config.slug },
          update: {
            title: config.title,
            metaTitle: config.metaTitle,
            metaDescription: config.metaDescription,
            content: config.content.trim(),
            category: config.category,
            isPublished: true,
            examId: exam.id,
          },
          create: {
            slug: config.slug,
            title: config.title,
            metaTitle: config.metaTitle,
            metaDescription: config.metaDescription,
            content: config.content.trim(),
            category: config.category,
            isPublished: true,
            examId: exam.id,
          }
        });
        logger.debug(`[SEO] Generated/Updated page: ${config.slug}`);
      } catch (error) {
        logger.error(`[SEO] Failed to generate page ${config.slug}:`, error);
      }
    }

    logger.info(`[SEO] Successfully generated ${pageConfigs.length} pages for exam: ${exam.title}`);
  }


  static async generateAllExamSeoPages() {
    const exams = await prisma.exam.findMany({
      where: { isPublished: true }
    });

    logger.info(`[SEO] Starting bulk generation for ${exams.length} exams`);

    for (const exam of exams) {
      await this.generateExamSeoPages(exam.id);
    }

    logger.info(`[SEO] Bulk generation completed`);
  }
}
