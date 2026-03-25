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
        metaTitle: `${examName} Recruitment ${year} Notification OUT — Apply Now ${wrap(exam.totalVacancies) !== 'TBA' ? `(${exam.totalVacancies} Posts)` : ''}`,
        metaDescription: `Download the official ${examName} notification PDF. Check important dates, vacancies, and eligibility details for ${body} ${examName} recruitment.`,
        content: `
# ${examName} Official Notification PDF
Looking for the ${examName} official notification? The ${body} has released the detailed advertisement for the current cycle.

## Key Highlights
- **Organization**: ${body}
- **Exam Name**: ${examName}
- **Official Website**: ${wrap(exam.officialWebsite)}
- **Total Posts**: ${wrap(exam.totalVacancies)}

## How to Download Notification
1. Visit the official portal: ${wrap(exam.officialWebsite)}.
2. Search for "${examName} Advertisement" in the latest news/notifications section.
3. Click on the download link to save the PDF for future reference.

## Frequently Asked Questions (FAQs)
**Q: Is the ${examName} ${year} notification released?**
A: Yes, the official notification is usually released a few weeks before the registration starts. Check the latest updates above.

**Q: Where can I download the ${examName} official PDF?**
A: You can download it directly from the ${body} official website or find the direct link on this page.

## What to Do Next?
After reading the notification, your next step should be to check the [${examName} Eligibility Criteria](/${baseSlug}-eligibility-criteria) and see if you qualify.
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
The ${body} has announced **${wrap(exam.totalVacancies, 'multiple')}** vacancies for various posts in the ${year} cycle.

## Category-wise Breakdown
Usually, the vacancies are split across:
- **Unreserved (UR)**: General category candidates.
- **OBC / EWS**: Candidates under backward and economically weaker sections.
- **SC / ST**: Reserved categories as per government norms.

## FAQs
**Q: How many vacancies are there in ${examName} ${year}?**
A: A total of ${wrap(exam.totalVacancies)} posts have been notified by the ${body}.

**Q: Are the vacancies temporary or permanent?**
A: Most government vacancies released via official notifications are permanent, but you should check the "Terms of Service" in the [Official Notification PDF](/${baseSlug}-notification-pdf).

## Next Step
If you are satisfied with the vacancy count, check the [${examName} Salary Structure](/${baseSlug}-salary-job-profile) to understand the pay scale.
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
*Candidates appearing in their final year might be eligible depending on the cutoff date mentioned in the notification.*

## Age Limit
**Criteria**: ${wrap(exam.age, 'Refer to official notification')}
*Age relaxation applies for OBC (3 years), SC/ST (5 years), and PwD candidates as per government norms.*

## FAQs
**Q: What is the minimum qualification for ${examName}?**
A: The basic requirement is ${wrap(exam.qualificationCriteria)}.

**Q: Is there any age relaxation?**
A: Yes, reserved category candidates get age relaxation as per GOI rules (usually 3-5 years).

## Next Step
Met the eligibility? Start your preparation by checking the [${examName} Syllabus and Exam Pattern](/${baseSlug}-syllabus-exam-pattern).
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
- **Allowances**: DA (Dearness Allowance), HRA (House Rent Allowance), Transport Allowance, and Medical Benefits.

## Job Responsibilities
Candidates selected for ${examName} will be responsible for ${wrap(exam.description, 'administrative and operational duties')} within the department.

## FAQs
**Q: What is the in-hand salary of ${examName}?**
A: After deductions like NPS and Tax, the in-hand salary is approximately 70-80% of the gross pay mentioned (${wrap(exam.salary)}).

## Next Step
Understand the [Selection Process](/${baseSlug}-selection-process) to know how to secure this position.
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
- **Mode**: Online (CBT) / Offline (Pen-Paper)
- **Type**: Objective (MCQs) / Descriptive
- **Marking**: Negative marking is usually 0.25 or 0.33 per wrong answer.

## Subjects Covered
Typically includes:
1. General Intelligence & Reasoning
2. Quantitative Aptitude (Maths)
3. English / Hindi Language
4. General Awareness (GK/Current Affairs)

## FAQs
**Q: Is there negative marking in ${examName}?**
A: Most objective stages have negative marking. Refer to the [Official Notification PDF](/${baseSlug}-notification-pdf) for exact details.

**Q: Is the ${examName} syllabus changed this year?**
A: Usually, the syllabus remains consistent. Any changes will be updated here immediately.

## Next Step
Practice with previous year trends and check the [${examName} Cut Off Marks](/${baseSlug}-cut-off-marks).
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
1. **Tier/Stage 1**: Online Computer Based Test (Screening).
2. **Tier/Stage 2**: Main Examination / Skill Test / Physical Test.
3. **Stage 3**: Document Verification (DV) & Medical Examination.
4. **Final Step**: Release of Merit List and Joining.

## FAQs
**Q: How many stages are there in ${examName}?**
A: Usually, there are 2 to 3 stages of selection.

## Next Step
Ready to apply? Check the [Registration Updates](/${baseSlug}-registration-updates) to see if forms are open.
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
1. Visit the official website: **${wrap(exam.officialWebsite)}**.
2. Look for the "Admit Card" or "Call Letter" section.
3. Enter your Registration Number and Date of Birth / Password.
4. Download and print the hall ticket.

## Important Documents for Exam
- Printout of Admit Card
- Original Photo ID Proof (Aadhar, PAN, etc.)
- Passport size photographs

## FAQs
**Q: When will the ${examName} admit card be released?**
A: Admit cards are typically released 10-14 days before the exam date.

**Q: I forgot my registration ID, what should I do?**
A: Use the "Forgot Password/ID" link on the official login page and check your registered email or phone for recovery.

## Next Step
After the exam, stay tuned for the [${examName} Answer Key](/${baseSlug}-answer-key).
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
- Navigate to the "Results" section.
- Click on the link for "${examName} Scorecard / Merit List".
- Enter your credentials if required, or download the PDF list of selected candidates.

## FAQs
**Q: When will ${examName} result be out?**
A: Results are usually announced 30-45 days after the examination.

**Q: Where can I see the merit list?**
A: The merit list PDF is published on ${wrap(exam.officialWebsite)}.

## Next Step
If you cleared the exam, prepare for [Document Verification](/${baseSlug}-document-verification-updates).
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
- **Difficulty Level**: Tougher papers lead to lower cut-offs.
- **Vacancies**: More posts usually mean slightly lower cut-offs.
- **Participation**: Higher number of candidates increases competition.

## FAQs
**Q: Is there a sectional cut-off in ${examName}?**
A: Some exams have sectional cut-offs. Check the [Syllabus & Pattern](/${baseSlug}-syllabus-exam-pattern) page for details.

## Next Step
Check the [Previous Year Merit List](/${baseSlug}-result) to see the marks of selected candidates.
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
If you find any discrepancies in the provisional key, you can "Raise Objections" by:
1. Logging into the candidate portal.
2. Selecting the question ID you wish to contest.
3. Uploading supporting documents and paying the required objection fee.

## FAQs
**Q: Can I challenge the ${examName} answer key?**
A: Yes, there is usually a 3 to 5-day window to raise objections after the provisional key is released.

## Next Step
Once objections are processed, wait for the [Final Result](/${baseSlug}-result).
        `
      }
    ];


    for (const event of exam.lifecycleEvents) {
      const stageSlug = event.stage.replace(/[\s_]+/g, '-').toLowerCase();

      pageConfigs.push({
        category: 'STAGES',
        slug: `${baseSlug}-${stageSlug}-updates`,
        title: `${examName} ${event.stage} Updates`,
        metaTitle: `${examName} ${event.stage} ${year}: Check Important Dates & Instructions`,
        metaDescription: `Get the latest updates for the ${event.stage} of ${examName} recruitment. Important dates, links, and detailed information for candidates.`,
        content: `
# ${examName} ${event.stage} Updates
This page covers the latest information regarding the **${event.stage}** of the ${examName} examination.

## Important Details
- **Current Status**: ${event.isTBD ? 'TBA' : 'Active/Upcoming'}
- **Action Required**: ${wrap(event.actionLabel, 'Check the links below')}
- **Description**: ${wrap(event.description)}

## Action Links
${event.actionUrl ? `[Click here to access the ${event.stage} portal](${event.actionUrl})` : 'The official link will be updated here as soon as it is active.'}

## Frequently Asked Questions
**Q: When does ${event.stage} start for ${examName}?**
A: According to the schedule, it starts on ${formatDate(event.startsAt) || 'TBA'}.

**Q: Where can I get official updates for this stage?**
A: Always refer to ${wrap(exam.officialWebsite)} for the most authentic information.

## Journey-Based Navigation
- Check out the [Full ${examName} Timeline](/${baseSlug})
- Go back to [Eligibility Criteria](/${baseSlug}-eligibility-criteria)
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

function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
