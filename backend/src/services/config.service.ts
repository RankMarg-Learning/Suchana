import prisma from '../config/database';

export async function getHomeBanners() {
    return prisma.homeBanner.findMany({
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    });
}

export async function getActiveBanners() {
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

export async function createHomeBanner(data: {
    imageUrl: string;
    actionUrl?: string;
    title?: string;
    description?: string;
    priority?: number;
    isActive?: boolean;
    expiresAt?: Date;
}) {
    return prisma.homeBanner.create({ data });
}

export async function updateHomeBanner(id: string, data: Partial<{
    imageUrl: string;
    actionUrl: string;
    title: string;
    description: string;
    priority: number;
    isActive: boolean;
    expiresAt: Date | null;
}>) {
    return prisma.homeBanner.update({ where: { id }, data });
}

export async function deleteHomeBanner(id: string) {
    return prisma.homeBanner.delete({ where: { id } });
}


export async function getAllAppConfigs() {
    return prisma.appConfig.findMany({ orderBy: { key: 'asc' } });
}

export async function getAppConfig(key: string) {
    const config = await prisma.appConfig.findUnique({ where: { key } });
    return config?.value;
}

export async function setAppConfig(key: string, value: any, description?: string) {
    return prisma.appConfig.upsert({
        where: { key },
        update: { value, description },
        create: { key, value, description }
    });
}

export async function deleteAppConfig(id: string) {
    return prisma.appConfig.delete({ where: { id } });
}
