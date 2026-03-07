const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const exams = await prisma.exam.findMany();
    for (const exam of exams) {
        const events = await prisma.lifecycleEvent.findMany({ where: { examId: exam.id } });
        console.log(`Exam: ${exam.title} (ID: ${exam.id}) has ${events.length} events.`);
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
