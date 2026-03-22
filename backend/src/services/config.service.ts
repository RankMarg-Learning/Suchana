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

export async function createHomeBanner(data: any) {
    const expiresAt = data.expiresAt && data.expiresAt.trim() !== "" ? new Date(data.expiresAt) : null;
    return prisma.homeBanner.create({
        data: {
            ...data,
            priority: data.priority ? Number(data.priority) : 0,
            isActive: data.isActive === true || data.isActive === 'true',
            expiresAt: (expiresAt && !isNaN(expiresAt.getTime())) ? expiresAt : null,
        }
    });
}

export async function updateHomeBanner(id: string, data: any) {
    const updateData: any = { ...data };

    if ('expiresAt' in data) {
        const expiresAt = data.expiresAt && data.expiresAt.trim() !== "" ? new Date(data.expiresAt) : null;
        updateData.expiresAt = (expiresAt && !isNaN(expiresAt.getTime())) ? expiresAt : null;
    }

    if ('priority' in data) {
        updateData.priority = Number(data.priority);
    }

    if ('isActive' in data) {
        updateData.isActive = data.isActive === true || data.isActive === 'true';
    }

    return prisma.homeBanner.update({ where: { id }, data: updateData });
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
