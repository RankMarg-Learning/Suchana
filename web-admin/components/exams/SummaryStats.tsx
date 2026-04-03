'use client';

import React from 'react';
import {
    Layers,
    Globe,
    CheckCircle2,
    Terminal
} from 'lucide-react';
import { Exam } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryStatsProps {
    exams: Exam[];
    loading?: boolean;
}

export default function ExamSummaryStats({ exams, loading }: SummaryStatsProps) {
    const total = exams.length;
    const published = exams.filter(e => !!e.isPublished).length;
    const active = exams.filter(e => e.status === 'REGISTRATION_OPEN' || e.status === 'ACTIVE').length;
    const unpublished = total - published;

    const stats = [
        { label: 'Total Exams', value: total, icon: Layers, description: 'Total executions recorded' },
        { label: 'Published', value: published, icon: Globe, description: 'Live on public platform' },
        { label: 'Active Status', value: active, icon: CheckCircle2, description: 'Exams with open cycles' },
        { label: 'Drafts', value: unpublished, icon: Terminal, description: 'Awaiting publication' },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-3 w-32 mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
                <Card key={idx} className="border shadow-sm hover:border-primary/20 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.label}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
