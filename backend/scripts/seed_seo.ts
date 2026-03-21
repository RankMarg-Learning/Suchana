import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pages = [
    {
      slug: "upsc-preparation-guide",
      title: "UPSC CSE 2025 Preparation Guide",
      metaTitle: "UPSC CSE 2025: Complete Preparation Guide & Strategy",
      metaDescription: "Master the UPSC Civil Services Examination with our comprehensive preparation guide. Strategy, resources, and timeline for 2025.",
      category: "GUIDES",
      ogImage: "https://images.unsplash.com/photo-1517842644237-48839248cbcd?q=80&w=2070&auto=format&fit=crop",
      content: `
# UPSC CSE 2025 Preparation Strategy

The Civil Services Examination (CSE) is one of the toughest exams in India. Here is a step-by-step guide to help you succeed.

## 1. Understand the Syllabus
The first step is to thoroughly read the UPSC syllabus for both Prelims and Mains.

## 2. Standard Resources
- **NCERTs** (Class 6-12)
- **Laxmikanth** for Polity
- **Spectrum** for Modern History
- **Ramesh Singh** for Economy

## 3. Current Affairs
Read 'The Hindu' or 'Indian Express' daily.

## 4. Mock Tests
Practice at least 50 tests before the actual Prelims.
      `,
      keywords: ["upsc 2025", "upsc strategy", "ias preparation", "upsc guide"]
    },
    {
      slug: "ssc-cgl-exam-pattern",
      title: "SSC CGL 2025 Exam Pattern & Syllabus",
      metaTitle: "SSC CGL 2025 Exam Pattern: Tier 1 & Tier 2 Detailed Syllabus",
      metaDescription: "Detailed breakdown of the SSC CGL 2025 exam pattern and syllabus. Understand the marking scheme and important topics.",
      category: "EXAM_RESOURCES",
      ogImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
      content: `
# SSC CGL 2025 Exam Pattern

SSC CGL is conducted in two Tiers. Here is the latest pattern.

## Tier I (Qualifying)
- **General Intelligence & Reasoning**: 25 Qs
- **General Awareness**: 25 Qs
- **Quantitative Aptitude**: 25 Qs
- **English Comprehension**: 25 Qs

## Tier II
Tier II involves Paper I (Compulsory for all posts) which includes Mathematical Abilities, Reasoning, English, and General Awareness.

### Sectional Timing
Each section in Tier II has a fixed time limit.
      `,
      keywords: ["ssc cgl pattern", "ssc 2025 syllabus", "ssc cgl tier 2"]
    },
    {
       slug: "best-banking-exams-in-india",
       title: "Top Banking Exams to Target in 2025",
       metaTitle: "Top 10 Banking Exams in India 2025: SBI, IBPS, RBI Grade B",
       metaDescription: "Looking for a career in banking? Check out the top banking exams in India including SBI PO, IBPS Clerk, and RBI Grade B.",
       category: "CAREERS",
       ogImage: "https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?q=80&w=2040&auto=format&fit=crop",
       content: `
# Top Banking Exams in India 2025

The banking sector offers some of the most stable and high-paying jobs in the government sector.

## 1. IBPS PO
Conducted across 11 nationalized banks.

## 2. SBI PO
Considered the most premium PO job in India.

## 3. RBI Grade B
The most prestigious and toughest banking exam.

## 4. RRB NTPC (Banking Side)
For regional rural banks.

Stay tuned to Exam Suchana for latest notifications!
       `,
       keywords: ["banking exams 2025", "sbi po", "ibps po", "rbi grade b"]
    }
  ];

  for (const page of pages) {
    await prisma.seoPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
    console.log(`Upserted SEO page: ${page.slug}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
