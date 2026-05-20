import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse';
import * as homeService from '../services/home.service';

export const getTrendingExams = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 6;
        const data = await homeService.getTrendingExams(limit);
        sendSuccess(res, { exams: data });
    } catch (error) {
        sendError(res, 500, 'FETCH_TRENDING_ERROR', 'Error fetching trending exams', error);
    }
};

export const getTickerExams = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 6;
        const data = await homeService.getTickerExams(limit);
        sendSuccess(res, { exams: data });
    } catch (error) {
        sendError(res, 500, 'FETCH_TICKER_ERROR', 'Error fetching ticker exams', error);
    }
};

export const getNews = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 4;
        const page = parseInt(req.query.page as string) || 1;
        const data = await homeService.getNews(limit, page);
        sendSuccess(res, { news: data });
    } catch (error) {
        sendError(res, 500, 'FETCH_NEWS_ERROR', 'Error fetching news', error);
    }
};

export const getPreviousYearPapers = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 2;
        const data = await homeService.getPreviousYearPapers(limit);
        sendSuccess(res, { pyq: data });
    } catch (error) {
        sendError(res, 500, 'FETCH_PYQ_ERROR', 'Error fetching previous year papers', error);
    }
};

export const getArticles = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 3;
        const page = parseInt(req.query.page as string) || 1;
        const data = await homeService.getArticles(limit, page);
        sendSuccess(res, { articles: data });
    } catch (error) {
        sendError(res, 500, 'FETCH_ARTICLES_ERROR', 'Error fetching articles', error);
    }
};



export const getClosingSoon = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 5;
        const data = await homeService.getClosingSoon(limit);
        sendSuccess(res, { closingSoon: data });
    } catch (error) {
        sendError(res, 500, 'FETCH_CLOSING_SOON_ERROR', 'Error fetching closing soon events', error);
    }
};
