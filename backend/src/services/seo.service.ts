import prisma from '../config/database';
import { logger } from '../utils/logger';

export class SeoService {
  static async generateExamSeoPages(examId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) return;

    const year = 2026;
    const baseSlug = exam.slug;
    const examName = exam.shortTitle || exam.title;

    const pageConfigs = [
      {
        type: 'exam-date',
        slug: `${baseSlug}-exam-date-${year}`,
        title: `${examName} Exam Date ${year}`,
        metaTitle: `${examName} Exam Date ${year}: Check Tier 1 & Tier 2 Schedule`,
        metaDescription: `Get the latest updates on ${examName} Exam Date ${year}. Check complete schedule, shift timings, and important instructions for the ${year} examination.`,
        category: 'EXAM_DATES',
        content: `
# ${examName} Exam Date ${year}

Stay updated with the latest schedule for the ${examName} examination for the year ${year}. Reliable information regarding shift timings and exam centers.

## Important Dates
- Notification Release: To be announced
- Application Process: Check official portal
- **Main Examination Date**: Expected in ${year}

## How to Check Exam Date?
1. Visit the official website: ${exam.officialWebsite || 'Official Portal'}
2. Look for the 'Latest News' or 'Notifications' section.
3. Find the link for "${examName} ${year} Exam Schedule".
4. Download the PDF and check your roll number range.

*Note: Always verify from official government sources.*
        `
      },
      {
        type: 'admit-card',
        slug: `${baseSlug}-admit-card-${year}`,
        title: `${examName} Admit Card ${year}`,
        metaTitle: `${examName} Admit Card ${year} Download Link: Hall Ticket Out?`,
        metaDescription: `Download your ${examName} Admit Card ${year} here. Direct link to hall ticket, reporting time, and mandatory documents list for ${examName} ${year}.`,
        category: 'ADMIT_CARD',
        content: `
# ${examName} Admit Card ${year}

The admit card for ${examName} ${year} is the most important document to carry to the examination hall. Here is how you can download it.

## Steps to Download Admit Card
1. Go to ${exam.officialWebsite || 'Official Website'}.
2. Click on the link "Download Hall Ticket for ${examName} ${year}".
3. Enter your Registration Number and Date of Birth.
4. Click Submit and download the PDF.

## Checklist for Exam Day
- Printed copy of Admit Card
- Original Photo ID Proof (Aadhar/Voter ID/PAN)
- Two recent passport size photographs
- Blue/Black ballpoint pen

Do not forget to reach the exam center 60 minutes before the reporting time.
        `
      },
      {
        type: 'result',
        slug: `${baseSlug}-result-${year}`,
        title: `${examName} Result ${year}`,
        metaTitle: `${examName} Result ${year} Declared: Check Merit List & Cut-off`,
        metaDescription: `Check ${examName} Result ${year} online. Direct link to merit list, category-wise cut-off marks, and scorecard for ${examName} ${year} recruitment.`,
        category: 'RESULTS',
        content: `
# ${examName} Result ${year}

Looking for ${examName} Result ${year}? The results are usually announced 30-45 days after the completion of the examination.

## How to Check ${examName} Result?
1. Visit the portal: ${exam.officialWebsite || 'Official Source'}.
2. Search for "${examName} ${year} Final Result".
3. Open the merit list PDF.
4. Press Ctrl+F and enter your name or roll number.

## Expected Cut-off ${year}
The cut-off marks depend on the difficulty level of the paper and the number of candidates. Stay tuned for official category-wise cut-off updates.

Congratulations to all the selected candidates!
        `
      }
    ];

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
        logger.info(`[SEO] Generated/Updated page: ${config.slug}`);
      } catch (error) {
        logger.error(`[SEO] Failed to generate page ${config.slug}:`, error);
      }
    }
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
