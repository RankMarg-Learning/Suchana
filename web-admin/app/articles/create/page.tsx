'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { seoService, examService, tagService, SeoPage } from '@/lib/api';
import ArticleEditor from '@/components/articles/ArticleEditor';
import { toast } from 'sonner';
import { useState } from 'react';

export default function CreateArticlePage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (data: Partial<SeoPage>, tagIds: string[]) => {
        setIsSaving(true);
        try {
            // 1. Create the article first
            const res = await seoService.createPage(data);
            if (!res.success || !res.data?.id) throw new Error('Failed to create article');

            const newPageId = res.data.id;
            console.log("page id ", newPageId)
            // 2. Attach tags (only if any were selected)
            if (tagIds.length > 0) {
                await tagService.setPageTags(newPageId, tagIds);
            }

            toast.success('Article published successfully');
            router.push('/seo');
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message || error?.message || 'Failed to publish article');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto py-0 max-w-7xl h-full min-h-screen">
            <ArticleEditor
                title="Create New Knowledge Article"
                isSaving={isSaving}
                onSave={handleSave}
            />
        </div>
    );
}
