'use client';

import React from 'react';
import { 
    Layers, 
    CheckCircle2, 
    XCircle, 
    Globe, 
    AlertCircle, 
    Clock, 
    Terminal,
    Users,
    Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Exam } from '@/lib/api';

interface SummaryStatsProps {
    exams: Exam[];
    loading?: boolean;
}

export default function ExamSummaryStats({ exams, loading }: SummaryStatsProps) {
    const total = exams.length;
    const published = exams.filter(e => !!e.isPublished).length;
    const draft = total - published;
    const active = exams.filter(e => e.status === 'REGISTRATION_OPEN' || e.status === 'ACTIVE').length;

    const stats = [
        { label: 'Execution Total', value: total, icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
        { label: 'Public Assets', value: published, icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
        { label: 'Active Gates', value: active, icon: CheckCircle2, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
        { label: 'Draft Staging', value: draft, icon: Terminal, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-100' },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-3xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, idx) => (
                <div key={idx} className={cn(
                    "relative group h-full rounded-[2.2rem] border overflow-hidden p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1",
                    stat.bg
                )}>
                    {/* Background Pattern */}
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                        <stat.icon className="w-24 h-24" />
                    </div>

                    <div className="relative space-y-3">
                        <div className="flex items-center justify-between">
                            <stat.icon className={cn("w-5 h-5", stat.color)} />
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/50 border border-white/80 shadow-sm">
                                <span className="text-[10px] font-black uppercase text-indigo-400">Live</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">{stat.label}</p>
                            <h3 className={cn("text-3xl font-black font-outfit tracking-tighter", stat.color)}>{stat.value}</h3>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
