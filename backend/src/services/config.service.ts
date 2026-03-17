import prisma from '../config/database';

export async function getHomeBanners() {
    return prisma.homeBanner.findMany({
        where: {
            isActive: true,
            OR: [
                { expiresAt: null },
                { expiresAt: { gte: new Date() } }
            ]
        },
        orderBy: { priority: 'desc' }
    });
}

export async function getAppConfig(key: string) {
    const config = await prisma.appConfig.findUnique({
        where: { key }
    });
    return config?.value;
}

export async function setAppConfig(key: string, value: any, description?: string) {
    return prisma.appConfig.upsert({
        where: { key },
        update: { value, description },
        create: { key, value, description }
    });
}
