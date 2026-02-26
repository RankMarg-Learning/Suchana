// ============================================================
// src/services/pushToken.service.ts  — Device push token management
// ============================================================
import prisma from '../config/database';
import type { RegisterPushTokenDto } from '../schemas/pushToken.schema';
import { logger } from '../utils/logger';

export async function registerToken(dto: RegisterPushTokenDto) {
    // Upsert: update if token exists, insert otherwise (device reinstalls etc.)
    const token = await prisma.pushToken.upsert({
        where: { token: dto.token },
        update: {
            userId: dto.userId,
            platform: dto.platform,
            deviceModel: dto.deviceModel,
            appVersion: dto.appVersion,
            isActive: true,
            updatedAt: new Date(),
        },
        create: {
            ...dto,
            isActive: true,
        },
    });

    logger.debug(`Push token registered: ${token.id} for user ${dto.userId}`);
    return token;
}

export async function deactivateToken(token: string) {
    await prisma.pushToken.updateMany({
        where: { token },
        data: { isActive: false, updatedAt: new Date() },
    });
}

export async function getActiveTokensForBroadcast(): Promise<string[]> {
    const tokens = await prisma.pushToken.findMany({
        where: { isActive: true },
        select: { token: true },
    });
    return tokens.map((t: { token: string }) => t.token);
}
