'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { seoService, examService, SeoPage } from '@/lib/api';
import ArticleEditor from '@/components/articles/ArticleEditor';
import { toast } from 'sonner';

export default function CreateArticlePage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: examsResponse } = useQuery({
        queryKey: ['exams-brief'],
        queryFn: () => examService.getAllExams({ limit: 100 }),
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<SeoPage>) => seoService.createPage(data),
        onSuccess: () => {
            toast.success('Article published successfully');
            queryClient.invalidateQueries({ queryKey: ['seo-pages-admin'] });
            router.push('/seo');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || 'Failed to publish article');
        }
    });

    return (
        <div className="container mx-auto py-0 max-w-7xl h-full min-h-screen">
            <ArticleEditor
                title="Create New Knowledge Article"
                exams={examsResponse?.data || []}
                isSaving={createMutation.isPending}
                onSave={(data) => createMutation.mutate(data)}
            />
        </div>
    );
}
