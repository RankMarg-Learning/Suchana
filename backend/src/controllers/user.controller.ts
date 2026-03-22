import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

export async function registerUser(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await userService.registerOrUpdateUser(req.body);
        res.status(200).json({ success: true, data: user });
    } catch (err) { next(err); }
}

export async function getUserByPhoneHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await userService.getUserByPhone(req.params.phone);
        res.json({ success: true, isRegistered: !!user, data: user || null });
    } catch (err) { next(err); }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await userService.getUserById(req.params.id);
        res.json({ success: true, data: user });
    } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.json({ success: true, data: user });
    } catch (err) { next(err); }
}

export async function getUserExams(req: Request, res: Response, next: NextFunction) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const result = await userService.getUserExams(req.params.id, page, limit);
        res.json({ success: true, ...result });
    } catch (err) { next(err); }
}

export async function toggleSavedExam(req: Request, res: Response, next: NextFunction) {
    try {
        const { examId } = req.body;
        const user = await userService.toggleSavedExam(req.params.id, examId);
        res.json({ success: true, data: user });
    } catch (err) { next(err); }
}
export async function getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
        const result = await userService.getUserNotifications(req.params.id);
        res.json({ success: true, data: result });
    } catch (err) { next(err); }
}
