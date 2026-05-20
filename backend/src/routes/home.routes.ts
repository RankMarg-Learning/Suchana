import { Router } from 'express';
import * as homeController from '../controllers/home.controller';

export const homeRouter = Router();

homeRouter.get('/trending', homeController.getTrendingExams);
homeRouter.get('/ticker', homeController.getTickerExams);
homeRouter.get('/trending-news', homeController.getNews);
homeRouter.get('/previous-year', homeController.getPreviousYearPapers);
homeRouter.get('/articles', homeController.getArticles);
homeRouter.get('/lifecycle/closing-soon', homeController.getClosingSoon);
