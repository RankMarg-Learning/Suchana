'use client';

import ExamForm from '@/components/exams/ExamForm';

export default function ExamCreatePage() {
    return <ExamForm isEdit={false} slug="new" />;
}
