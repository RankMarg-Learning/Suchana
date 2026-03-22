import prisma from '../src/config/database';
import { SeoService } from '../src/services/seo.service';
import { logger } from '../src/utils/logger';

async function main() {
  logger.info('Starting bulk SEO generation for all existing exams...');
  await SeoService.generateAllExamSeoPages();
  logger.info('Bulk SEO generation completed!');
}

main()
  .catch((e) => {
    logger.error('Bulk SEO generation failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
