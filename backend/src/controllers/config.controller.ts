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

export async function createHomeBanner(req: Request, res: Response, next: NextFunction) {
    try {
        const banner = await configService.createHomeBanner(req.body);
        sendSuccess(res, banner, 201);
    } catch (err) {
        next(err);
    }
}

export async function updateHomeBanner(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const banner = await configService.updateHomeBanner(id, req.body);
        sendSuccess(res, banner);
    } catch (err) {
        next(err);
    }
}

export async function deleteHomeBanner(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        await configService.deleteHomeBanner(id);
        sendSuccess(res, { deleted: true });
    } catch (err) {
        next(err);
    }
}

// ────────── App Config ────────────────────────────────────────

export async function getAllAppConfigs(req: Request, res: Response, next: NextFunction) {
    try {
        const configs = await configService.getAllAppConfigs();
        sendSuccess(res, configs);
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

export async function setAppConfig(req: Request, res: Response, next: NextFunction) {
    try {
        const { key, value, description } = req.body;
        const config = await configService.setAppConfig(key, value, description);
        sendSuccess(res, config);
    } catch (err) {
        next(err);
    }
}

export async function deleteAppConfig(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        await configService.deleteAppConfig(id);
        sendSuccess(res, { deleted: true });
    } catch (err) {
        next(err);
    }
}
