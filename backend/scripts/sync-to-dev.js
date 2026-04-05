const { PrismaClient } = require('@prisma/client');

/**
 * DATABASE SYNC SCRIPT
 * 
 * This script syncs content from a Source Database to a Destination (Dev) Database.
 * It strictly follows dependency order to ensure foreign key constraints are met.
 * 
 * Usage:
 * SOURCE_DATABASE_URL="..." DEV_DATABASE_URL="..." node scripts/sync-to-dev.js
 */

async function main() {
  const sourceUrl = "postgresql://postgres.xuaiuzgswcdeeghsjnsz:@niketsudke0M@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";
  const destUrl = "postgresql://neondb_owner:npg_bFrO3CE6gWwA@ep-little-leaf-a101oxa9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

  if (!sourceUrl || !destUrl) {
    console.error('❌ Error: Please provide both SOURCE_DATABASE_URL and DEV_DATABASE_URL');
    process.exit(1);
  }

  const sourceClient = new PrismaClient({
    datasources: { db: { url: sourceUrl } },
  });

  const destClient = new PrismaClient({
    datasources: { db: { url: destUrl } },
  });

  console.log('🔌 Connected to both databases...');

  const models = [
    { name: 'ScrapeSource', label: 'Scrape Sources' },
    { name: 'ScrapeJob', label: 'Scrape Jobs' },
    { name: 'StagedExam', label: 'Staged Exams' },
    { name: 'StagedLifecycleEvent', label: 'Staged Lifecycle Events' },
    { name: 'Exam', label: 'Exams' },
    { name: 'LifecycleEvent', label: 'Lifecycle Events' },
    { name: 'SeoPage', label: 'SEO Pages' },
    { name: 'AppConfig', label: 'App Config' },
    { name: 'HomeBanner', label: 'Home Banners' },
  ];

  try {
    for (const model of models) {
      const prismaModel = model.name.charAt(0).toLowerCase() + model.name.slice(1);
      console.log(`\n📦 Syncing ${model.label}...`);

      // 1. Fetch all from source using Raw SQL to avoid schema mismatch errors
      // This will only fetch the columns that actually exist in the source DB table
      const data = await sourceClient.$queryRawUnsafe(`SELECT * FROM "${model.name}"`);
      console.log(`   - Found ${data.length} records in source.`);

      if (data.length === 0) continue;

      // 2. Batch upsert into destination
      // We use upsert to avoid duplicate errors if the script is re-run
      let count = 0;
      for (const item of data) {
        // Prepare data for Prisma upsert
        const { id, ...content } = item;

        await destClient[prismaModel].upsert({
          where: { id },
          update: content,
          create: item,
        });

        count++;
        if (count % 50 === 0) process.stdout.write('.');
      }

      console.log(`\n   ✅ Synced ${count} records.`);
    }

    console.log('\n✨ Database sync completed successfully!');
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
  } finally {
    await sourceClient.$disconnect();
    await destClient.$disconnect();
  }
}

main();
