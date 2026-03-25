'use client';

import React from 'react';
import { 
    Calendar, 
    Globe, 
    Building2, 
    Briefcase, 
    Users, 
    MapPin, 
    ShieldCheck, 
    Clock, 
    ArrowRight,
    ExternalLink,
    FileText,
    Zap,
    Trophy,
    Target
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Exam } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface ExamDetailPreviewProps {
    exam: Partial<Exam>;
    className?: string;
}

export default function ExamDetailPreview({ exam, className }: ExamDetailPreviewProps) {
    const statusStyles: Record<string, string> = {
        ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
        REGISTRATION_OPEN: "bg-emerald-50 text-emerald-700 border-emerald-100",
        NOTIFICATION: "bg-blue-50 text-blue-700 border-blue-100",
        RESULT_DECLARED: "bg-amber-50 text-amber-700 border-amber-100",
        ADMIT_CARD_OUT: "bg-purple-50 text-purple-700 border-purple-100",
        ARCHIVED: "bg-slate-50 text-slate-500 border-slate-100",
        EXAM_ONGOING: "bg-indigo-50 text-indigo-700 border-indigo-100",
        REGISTRATION_CLOSED: "bg-rose-50 text-rose-600 border-rose-100",
    };

    const statusStyle = (exam.status && statusStyles[exam.status]) || "bg-gray-50 text-gray-700 border-gray-100";

    return (
        <div className={cn("bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl shadow-indigo-500/5", className)}>
            {/* Hero Section */}
            <div className="relative p-8 pb-32 bg-slate-900 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
                <div className="absolute -bottom-24 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border-none", statusStyle)}>
                            {exam.status?.replace(/_/g, ' ') || 'DRAFT'}
                        </Badge>
                        <div className="flex items-center gap-2 text-slate-400">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{(exam.examLevel || 'GENERAL').replace(/_/g, ' ')} Execution</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-white font-outfit tracking-tighter max-w-2xl leading-tight">
                        {exam.title || 'Untitled Exam Asset'}
                    </h1>
                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-indigo-300">
                            <Building2 className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-tight">{exam.conductingBody || 'Authority Pending'}</span>
                        </div>
                        {exam.shortTitle && (
                            <div className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
                                {exam.shortTitle}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="relative -mt-16 mx-8 grid grid-cols-4 gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-900/5 items-center">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-3 h-3 text-indigo-500" /> Population
                    </p>
                    <p className="text-sm font-bold text-slate-900">{exam.totalVacancies || '---'}</p>
                </div>
                <div className="space-y-1 border-x border-slate-50 px-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" /> Taxonomy
                    </p>
                    <p className="text-sm font-bold text-slate-900 uppercase truncate">{(exam.category || 'General').replace(/_/g, ' ')}</p>
                </div>
                <div className="space-y-1 border-r border-slate-50 px-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3 h-3 text-amber-500" /> Pulse
                    </p>
                    <p className="text-sm font-bold text-slate-900">{exam.updatedAt ? formatDate(exam.updatedAt).split(',')[0] : 'Just now'}</p>
                </div>
                <div className="pl-4">
                    {exam.officialWebsite && (
                        <a 
                            href={exam.officialWebsite} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <ExternalLink className="w-3.5 h-3.5" /> Portal
                        </a>
                    )}
                </div>
            </div>

            {/* Content Preview */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Execution Overview</h3>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                            {exam.description || 'No detailed brief available for this exam execution yet.'}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Eligibility Core</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white border border-slate-100 rounded-[1.8rem] space-y-2">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qualification</p>
                                <p className="text-xs font-bold text-slate-700 leading-tight">{exam.qualificationCriteria || 'Not specified'}</p>
                            </div>
                            <div className="p-5 bg-white border border-slate-100 rounded-[1.8rem] space-y-2">
                                <Target className="w-4 h-4 text-sky-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age Range</p>
                                <p className="text-xs font-bold text-slate-700 leading-tight">{exam.age || 'Standard rules apply'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="p-6 bg-slate-50 rounded-[2.2rem] border border-slate-100 space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-3">Lifecycle Links</h4>
                        
                        <div className="space-y-3">
                            {exam.notificationUrl && (
                                <a href={exam.notificationUrl} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl group hover:border-indigo-500 transition-all">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-rose-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Official PDF</span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                </a>
                            )}
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between opacity-50 grayscale">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Apply Tracker</span>
                                </div>
                                <span className="text-[8px] font-bold text-slate-400">Soon</span>
                            </div>
                        </div>

                        <div className="pt-2 text-center">
                            <p className="text-[9px] font-bold text-slate-400">Action links are updated in real-time based on lifecycle events.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
