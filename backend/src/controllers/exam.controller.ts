import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import * as examService from '../services/exam.service';
import { sendSuccess, buildPaginationMeta } from '../utils/apiResponse';
import type { CreateExamDto, UpdateExamDto, ListExamQuery } from '../schemas/exam.schema';

export async function listExams(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query as unknown as ListExamQuery;
        const { exams, total } = await examService.listExams(query);
        sendSuccess(res, exams, 200, buildPaginationMeta(total, query.page, query.limit));
    } catch (err) {
        next(err);
    }
}

export async function getExamById(req: Request, res: Response, next: NextFunction) {
    try {
        const exam = await examService.getExamById(req.params.id as string);
        sendSuccess(res, exam);
    } catch (err) {
        next(err);
    }
}

export async function getExamBySlug(req: Request, res: Response, next: NextFunction) {
    try {
        const exam = await examService.getExamBySlug(req.params.slug as string);
        sendSuccess(res, exam);
    } catch (err) {
        next(err);
    }
}

export async function createExam(req: Request, res: Response, next: NextFunction) {
    try {
        const exam = await examService.createExam(req.body as CreateExamDto, req.adminId!);
        sendSuccess(res, exam, 201);
    } catch (err) {
        next(err);
    }
}

export async function updateExam(req: Request, res: Response, next: NextFunction) {
    try {
        const exam = await examService.updateExam(req.params.id as string, req.body as UpdateExamDto, req.adminId!);
        sendSuccess(res, exam);
    } catch (err) {
        next(err);
    }
}

export async function deleteExam(req: Request, res: Response, next: NextFunction) {
    try {
        await examService.deleteExam(req.params.id as string, req.adminId!);
        sendSuccess(res, { deleted: true });
    } catch (err) {
        next(err);
    }
}
export async function getSavedExams(req: Request, res: Response, next: NextFunction) {
    try {
        const exams = await examService.getSavedExams(req.params.id as string);
        sendSuccess(res, exams);
    } catch (err) {
        next(err);
    }
}

export async function sendManualNotification(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const { title, body, targetAudience } = req.body;
        const result = await NotificationService.sendManualExamNotification(id, title, body, targetAudience);
        sendSuccess(res, result);
    } catch (err) {
        next(err);
    }
}
