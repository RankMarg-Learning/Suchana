const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const events = await prisma.lifecycleEvent.findMany({
        include: {
            exam: { select: { title: true } }
        }
    });
    console.log('Lifecycle Events in DB:');
    console.table(events.map(e => ({
        id: e.id,
        exam: e.exam.title,
        type: e.eventType,
        title: e.title,
        startsAt: e.startsAt
    })));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
