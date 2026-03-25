import { Request, Response, NextFunction } from 'express';
import * as lifecycleService from '../services/lifecycle.service';
import { sendSuccess } from '../utils/apiResponse';
import type {
    CreateLifecycleEventDto,
    UpdateLifecycleEventDto,
} from '../schemas/lifecycle.schema';

export async function getTimeline(req: Request, res: Response, next: NextFunction) {
    try {
        const timeline = await lifecycleService.getExamTimeline(req.params.id as string);
        sendSuccess(res, timeline);
    } catch (err) {
        next(err);
    }
}

export async function addEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event = await lifecycleService.addLifecycleEvent(
            req.params.id as string,
            req.body as CreateLifecycleEventDto,
            req.adminId!
        );
        sendSuccess(res, event, 201);
    } catch (err) {
        next(err);
    }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event = await lifecycleService.updateLifecycleEvent(
            req.params.id as string,
            req.params.eventId as string,
            req.body as UpdateLifecycleEventDto,
            req.adminId!
        );
        sendSuccess(res, event);
    } catch (err) {
        next(err);
    }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
        await lifecycleService.deleteLifecycleEvent(
            req.params.id as string,
            req.params.eventId as string,
            req.adminId!
        );
        sendSuccess(res, { deleted: true });
    } catch (err) {
        next(err);
    }
}
export async function getAllEvents(req: Request, res: Response, next: NextFunction) {
    try {
        const events = await lifecycleService.getAllEvents();
        sendSuccess(res, events);
    } catch (err) {
        next(err);
    }
}
