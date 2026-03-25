'use client';

import React from 'react';
import { 
    Calendar, 
    MapPin, 
    Briefcase, 
    ChevronRight, 
    Building2,
    Users,
    ArrowRight,
    Globe,
    Clock,
    ShieldCheck
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Exam } from '@/lib/api';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface ExamCardProps {
    exam: Exam;
    className?: string;
}

export default function ExamCard({ exam, className }: ExamCardProps) {
    const statusStyle: Record<string, string> = {
        ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
        REGISTRATION_OPEN: "bg-emerald-50 text-emerald-700 border-emerald-100",
        NOTIFICATION: "bg-blue-50 text-blue-700 border-blue-100",
        RESULT_DECLARED: "bg-amber-50 text-amber-700 border-amber-100",
        ADMIT_CARD_OUT: "bg-purple-50 text-purple-700 border-purple-100",
        ARCHIVED: "bg-slate-50 text-slate-500 border-slate-100",
        EXAM_ONGOING: "bg-indigo-50 text-indigo-700 border-indigo-100",
        REGISTRATION_CLOSED: "bg-rose-50 text-rose-600 border-rose-100",
    };

    const currentStyle = statusStyle[exam.status] || "bg-gray-50 text-gray-700 border-gray-100";

    return (
        <div className={cn(
            "group bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300",
            className
        )}>
            <div className="flex flex-col h-full space-y-4">
                {/* Header: Status and Level */}
                <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn("px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-lg border", currentStyle)}>
                        {exam.status.replace(/_/g, ' ')}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Globe className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{exam.examLevel}</span>
                    </div>
                </div>

                {/* Identity */}
                <div className="space-y-1">
                    <Link href={`/exams/${exam.slug || exam.id}/edit`}>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 font-outfit leading-snug">
                            {exam.title}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <Building2 className="w-3 h-3 text-slate-300" />
                        <p className="text-[10px] font-bold uppercase tracking-tight truncate">
                            {exam.conductingBody || 'Unknown Authority'}
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-50">
                    <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Vacancies</p>
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[11px] font-bold text-slate-700">{exam.totalVacancies || '---'}</span>
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight truncate">
                                {exam.category.split('_')[0]}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer and Call to Action */}
                <div className="pt-2 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">{exam.updatedAt ? formatDate(exam.updatedAt).split(',')[0] : 'Just now'}</span>
                    </div>
                    
                    <Link 
                        href={`/exams/${exam.slug || exam.id}/edit`}
                        className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
