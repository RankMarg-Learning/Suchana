import { Request, Response } from 'express';
import { authorService } from '../services/author.service';

export const authorController = {
    async getAll(req: Request, res: Response) {
        try {
            const authors = await authorService.getAll();
            res.json({ success: true, data: authors });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    async getById(req: Request, res: Response) {
        try {
            const author = await authorService.getById(req.params.id);
            if (!author) {
                return res.status(404).json({ success: false, message: 'Author not found' });
            }
            res.json({ success: true, data: author });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    async getBySlug(req: Request, res: Response) {
        try {
            const author = await authorService.getBySlug(req.params.slug);
            if (!author) {
                return res.status(404).json({ success: false, message: 'Author not found' });
            }
            res.json({ success: true, data: author });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    async create(req: Request, res: Response) {
        try {
            const author = await authorService.create(req.body);
            res.status(201).json({ success: true, data: author });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    async update(req: Request, res: Response) {
        try {
            const author = await authorService.update(req.params.id, req.body);
            res.json({ success: true, data: author });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    async delete(req: Request, res: Response) {
        try {
            await authorService.delete(req.params.id);
            res.json({ success: true, message: 'Author deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
