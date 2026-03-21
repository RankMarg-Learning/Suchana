import prisma from '../src/config/database';
async function main() {
  const pages = await prisma.seoPage.findMany({ select: { slug: true }, take: 20 });
  console.log(pages.map(p => p.slug));
}
main().finally(() => prisma.$disconnect());
