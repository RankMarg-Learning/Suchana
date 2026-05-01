import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const authorService = {
    async getAll() {
        return await prisma.author.findMany({
            orderBy: { name: 'asc' }
        });
    },

    async getById(id: string) {
        return await prisma.author.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { exams: true, seoPages: true }
                }
            }
        });
    },

    async getBySlug(slug: string) {
        return await prisma.author.findUnique({
            where: { slug },
            include: {
                exams: {
                    select: { 
                        id: true, 
                        title: true, 
                        slug: true, 
                        status: true 
                    }
                },
                seoPages: {
                    where: { isPublished: true },
                    select: { 
                        id: true, 
                        title: true, 
                        slug: true
                    }
                }
            }
        });
    },

    async create(data: {
        name: string;
        slug: string;
        image?: string;
        designation?: string;
        bio?: string;
        isActive?: boolean;
    }) {
        return await prisma.author.create({
            data
        });
    },

    async update(id: string, data: Partial<{
        name: string;
        slug: string;
        image: string | null;
        designation: string | null;
        bio: string | null;
        isActive: boolean;
    }>) {
        return await prisma.author.update({
            where: { id },
            data
        });
    },

    async delete(id: string) {
        return await prisma.author.delete({
            where: { id }
        });
    }
};
