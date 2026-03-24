'use client';

import { use } from 'react';
import { useState, useEffect } from 'react';
import ExamForm from '@/components/exams/ExamForm';
import { examService } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function ExamEditPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            examService.getExamBySlug(slug)
                .then(res => {
                    const data = res.data || res;
                    setInitialData(data);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [slug]);

    if(loading) {
        return <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
    }

    if (!initialData) {
        return <div className="p-8 text-center text-gray-500 font-bold uppercase">Exam not found or couldn't be loaded</div>;
    }

    return <ExamForm initialData={initialData} isEdit={true} slug={slug} />;
}
