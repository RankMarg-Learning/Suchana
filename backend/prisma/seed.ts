import { PrismaClient } from '@prisma/client';
import { slugify, uniqueSlug } from '../src/utils/slugify';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding and slug backfilling...');

    const exams = await prisma.exam.findMany();

    if (exams.length === 0) {
        console.log('Database has no exams! Creating initial seed data...');

        const upscTitle = "UPSC Civil Services Examination 2025";
        await prisma.exam.create({
            data: {
                title: upscTitle,
                shortTitle: "UPSC CSE 2025",
                description: "The Civil Services Examination is a nationwide competitive examination in India conducted by the Union Public Service Commission.",
                category: "UPSC",
                conductingBody: "Union Public Service Commission",
                slug: slugify(upscTitle),
                minAge: 21,
                maxAge: 32,
                totalVacancies: 1056,
                applicationFee: {
                    "General/OBC": 100,
                    "SC/ST/PH/Female": 0
                },
                officialWebsite: "https://upsc.gov.in",
                notificationUrl: "https://upsc.gov.in/notif.pdf",
                isPublished: true,
                createdBy: "seed_admin"
            }
        });

        const sscTitle = "SSC Combined Graduate Level Examination 2024";
        await prisma.exam.create({
            data: {
                title: sscTitle,
                shortTitle: "SSC CGL 2024",
                description: "Staff Selection Commission - Combined Graduate Level Examination, conducted to recruit staff to various posts.",
                category: "SSC",
                conductingBody: "Staff Selection Commission",
                slug: slugify(sscTitle),
                minAge: 18,
                maxAge: 32,
                totalVacancies: 17727,
                applicationFee: {
                    "General/OBC": 100,
                    "SC/ST/PH/Women": 0
                },
                officialWebsite: "https://ssc.gov.in",
                isPublished: true,
                createdBy: "seed_admin"
            }
        });

        console.log('Seed created successfully.');
        return;
    }

    console.log(`Found ${exams.length} exams. Validating their slugs...`);

    for (const exam of exams) {
        const expectedBaseSlug = slugify(exam.title);

        // If they already have a matching slug prefix, skip it
        if (exam.slug && exam.slug.startsWith(expectedBaseSlug)) {
            console.log(`✔ Exam [${exam.id}] already has a valid slug: ${exam.slug}`);
            continue;
        }

        // Generate a new unique slug
        let newSlug = expectedBaseSlug;
        const exists = await prisma.exam.findUnique({ where: { slug: newSlug } });

        if (exists && exists.id !== exam.id) {
            newSlug = uniqueSlug(exam.title);
        }

        await prisma.exam.update({
            where: { id: exam.id },
            data: { slug: newSlug }
        });
        console.log(`➔ Updated exam [${exam.id}] slug to: ${newSlug}`);
    }

    console.log('Slug backfill completed.');
}

main()
    .catch((e) => {
        console.error('Seed/Backfill encountered an error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
