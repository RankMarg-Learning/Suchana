'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { seoService, examService, tagService, revalidationService, SeoPage } from '@/lib/api';
import ArticleEditor from '@/components/articles/ArticleEditor';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function EditArticlePage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const queryClient = useQueryClient();
    const [isSaving, setIsSaving] = useState(false);

    const { data: pageResponse, isLoading } = useQuery({
        queryKey: ['seo-page-details', slug],
        queryFn: () => seoService.getPageBySlug(slug),
        enabled: !!slug,
    });

    const handleSave = async (data: Partial<SeoPage>, tagIds: string[]) => {
        const pageId = (pageResponse?.data as any)?.id;
        if (!pageId) {
            toast.error('Error: Article ID is missing. Please refresh the page.');
            return;
        }

        setIsSaving(true);
        try {
            const { id, exam, author, createdAt, updatedAt, tags, ...sanitizedData } = data as any;

            const res = await seoService.updatePage(pageId, sanitizedData);
            if (!res.success) throw new Error('Failed to update article');

            await tagService.setPageTags(pageId, tagIds);

            toast.success('Article updated successfully');
            queryClient.invalidateQueries({ queryKey: ['seo-pages-admin'] });
            queryClient.invalidateQueries({ queryKey: ['seo-page-details', slug] });
            
            // Revalidate frontend
            try {
                const updatedSlug = sanitizedData.slug || slug;
                await revalidationService.triggerRevalidation({
                    paths: ['/', '/articles', `/${updatedSlug}`],
                    tag: 'seo-pages-list'
                });
                toast.success('Frontend cache updated');
            } catch (err) {}
            
            router.push('/seo');
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message || error?.message || 'Failed to update article');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 max-w-7xl animate-pulse space-y-6">
                <Skeleton className="h-20 w-full rounded-3xl" />
                <div className="grid grid-cols-12 gap-6 h-[700px]">
                    <Skeleton className="col-span-8 rounded-3xl" />
                    <Skeleton className="col-span-4 rounded-3xl" />
                </div>
            </div>
        );
    }

    if (!pageResponse?.data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h1 className="text-2xl font-bold font-outfit text-slate-900 tracking-tight">Article Not Found</h1>
                <p className="text-slate-500 font-medium">
                    The article with slug <span className="text-indigo-600 font-mono font-bold">/{slug}</span> does not exist or has been removed.
                </p>
                <Button variant="outline" onClick={() => router.push('/seo')} className="rounded-xl border-slate-200">
                    Go Back to Manager
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-0 max-w-7xl h-full min-h-screen">
            <ArticleEditor
                title={`Edit Article: ${pageResponse.data.title}`}
                initialData={pageResponse.data}
                isSaving={isSaving}
                onSave={handleSave}
            />
        </div>
    );
}
