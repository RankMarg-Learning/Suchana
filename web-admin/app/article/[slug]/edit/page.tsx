'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { seoService, examService, SeoPage } from '@/lib/api';
import ArticleEditor from '@/components/articles/ArticleEditor';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditArticlePage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;
    const queryClient = useQueryClient();

    const { data: pageResponse, isLoading } = useQuery({
        queryKey: ['seo-page-details', slug],
        queryFn: () => seoService.getPageBySlug(slug),
        enabled: !!slug,
    });

    const { data: examsResponse } = useQuery({
        queryKey: ['exams-brief'],
        queryFn: () => examService.getAllExams({ limit: 100 }),
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<SeoPage>) => {
            const pageId = (pageResponse?.data as any)?.id;

            const {
                id,
                exam,
                createdAt,
                updatedAt,
                ...sanitizedData
            } = data as any;

            if (!pageId) {
                toast.error("Error: Article ID is missing. Please refresh the page.");
                throw new Error("Article ID is undefined");
            }

            return seoService.updatePage(pageId, sanitizedData);
        },
        onSuccess: () => {
            toast.success('Article updated successfully');
            queryClient.invalidateQueries({ queryKey: ['seo-pages-admin'] });
            queryClient.invalidateQueries({ queryKey: ['seo-page-details', slug] });
            router.push('/seo');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || 'Failed to update article');
        }
    });

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
                <h1 className="text-2xl font-bold font-outfit text-slate-900tracking-tight">Article Not Found</h1>
                <p className="text-slate-500 font-medium">The article with slug <span className="text-indigo-600 font-mono font-bold">/{slug}</span> does not exist or has been removed.</p>
                <Button variant="outline" onClick={() => router.push('/seo')} className="rounded-xl border-slate-200">
                    Go Back to Manager
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-7xl h-full min-h-screen">
            <ArticleEditor
                title={`Edit Article: ${pageResponse.data.title}`}
                initialData={pageResponse.data}
                exams={examsResponse?.data || []}
                isSaving={updateMutation.isPending}
                onSave={(data) => updateMutation.mutate(data)}
            />
        </div>
    );
}

// Minimal Button internal fallback if needed, or import it
import { Button } from '@/components/ui/button';
