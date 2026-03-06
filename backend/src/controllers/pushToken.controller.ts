import { Request, Response, NextFunction } from 'express';
import * as pushTokenService from '../services/pushToken.service';
import { sendSuccess } from '../utils/apiResponse';
import type { RegisterPushTokenDto } from '../schemas/pushToken.schema';

export async function registerToken(req: Request, res: Response, next: NextFunction) {
    try {
        const token = await pushTokenService.registerToken(req.body as RegisterPushTokenDto);
        sendSuccess(res, token, 201);
    } catch (err) {
        next(err);
    }
}

export async function deactivateToken(req: Request, res: Response, next: NextFunction) {
    try {
        await pushTokenService.deactivateToken(req.body.token as string);
        sendSuccess(res, { deactivated: true });
    } catch (err) {
        next(err);
    }
}
