const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const events = await prisma.lifecycleEvent.findMany({ select: { id: true, eventType: true, startsAt: true, endsAt: true, title: true } });
    console.table(events);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
