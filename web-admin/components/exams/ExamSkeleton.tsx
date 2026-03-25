'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExamCardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn(
            "bg-white border border-slate-100 rounded-2xl p-5 space-y-4 animate-pulse",
            className
        )}>
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 rounded-lg" />
                <Skeleton className="h-3 w-12 rounded-lg" />
            </div>
            
            <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>

            <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-24 rounded-md" />
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-50">
                <div className="space-y-1">
                    <Skeleton className="h-2 w-10 rounded-sm" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                </div>
                <div className="space-y-1">
                    <Skeleton className="h-2 w-10 rounded-sm" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
        </div>
    );
}

export function ExamGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ExamCardSkeleton key={i} />
            ))}
        </div>
    );
}
