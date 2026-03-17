import { Request, Response, NextFunction } from 'express';
import * as configService from '../services/config.service';
import { sendSuccess } from '../utils/apiResponse';

export async function getHomeBanners(req: Request, res: Response, next: NextFunction) {
    try {
        const banners = await configService.getHomeBanners();
        sendSuccess(res, banners);
    } catch (err) {
        next(err);
    }
}

export async function getAppConfig(req: Request, res: Response, next: NextFunction) {
    try {
        const { key } = req.params;
        const config = await configService.getAppConfig(key);
        sendSuccess(res, config);
    } catch (err) {
        next(err);
    }
}
