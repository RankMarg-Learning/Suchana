'use client';

import { useState, useEffect } from 'react';
import { 
    ClipboardList, 
    Search, 
    Filter, 
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    ArrowUpRight, 
    Clock, 
    ExternalLink,
    ChevronRight,
    SearchCheck,
    Terminal,
    Eye,
    Zap,
    MessageSquare
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { scraperService, StagedExam } from '@/lib/api';

export default function ReviewQueuePage() {
    const [stagedExams, setStagedExams] = useState<StagedExam[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');

    useEffect(() => {
        const fetchStaged = async () => {
            try {
                const res = await scraperService.listStagedExams({ status: filter });
                setStagedExams(res.data || []);
            } catch (error) {
                console.error('Failed to fetch staged exams:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaged();
    }, [filter]);

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-outfit">Review Queue</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Validate and approve automated exam entries before they go live.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-2xl border border-border/50">
                        {['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                    filter === status 
                                        ? "bg-card text-foreground shadow-sm border border-border/50" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid of Results */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {loading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-muted/30 rounded-3xl animate-pulse" />)
                ) : stagedExams.length > 0 ? (
                    stagedExams.map((staged) => (
                        <div key={staged.id} className="premium-card rounded-3xl p-8 group relative overflow-hidden flex flex-col gap-6 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700">
                            {/* Confidence Badge */}
                            <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs uppercase tracking-widest",
                                    (staged.aiConfidence || 0) > 0.8 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                )}>
                                    <Zap className="w-3.5 h-3.5 fill-current" />
                                    AI Confidence: {Math.round((staged.aiConfidence || 0) * 100)}%
                                </div>
                                {staged.isDuplicate && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        Potential Duplicate
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-muted group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center font-bold text-3xl transition-all duration-500 rotate-3 group-hover:rotate-0">
                                    {staged.title[0]}
                                </div>
                                <div className="flex-1 space-y-2 pr-24">
                                    <h3 className="text-2xl font-bold font-outfit leading-tight group-hover:text-primary transition-colors">{staged.title}</h3>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-lg border border-border/50">
                                            {staged.scrapeJob?.scrapeSource?.label || 'Unknown Source'}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{staged.category || 'OTHER'}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 italic">
                                "{staged.aiNotes || 'AI processed this candidate from the source. Review for accuracy.'}"
                            </p>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-t border-b border-border/50">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-outfit opacity-70">Vacancies</span>
                                    <span className="text-sm font-bold truncate">{staged.totalVacancies || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-outfit opacity-70">Events</span>
                                    <span className="text-sm font-bold truncate">{staged.stagedEvents?.length || 0} stages</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-outfit opacity-70">Exam Level</span>
                                    <span className="text-sm font-bold truncate">{staged.examLevel || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-outfit opacity-70">Salary</span>
                                    <span className="text-sm font-bold truncate">{staged.salary || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-sm font-bold transition-all duration-300">
                                        <Eye className="w-4 h-4" />
                                        <span>Preview</span>
                                    </button>
                                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-sm font-bold transition-all duration-300">
                                        <Terminal className="w-4 h-4" />
                                        <span>Raw Data</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                    <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all duration-300 font-bold">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>Approve</span>
                                    </button>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -bottom-2 -left-2 text-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rotate-12">
                                <SearchCheck className="w-32 h-32" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full p-20 text-center flex flex-col items-center gap-6 bg-card border border-dashed border-border/50 rounded-3xl">
                        <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                            <ClipboardList className="w-12 h-12 opacity-30" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold font-outfit">Nothing to review here</h3>
                            <p className="text-muted-foreground">All staged exams in this status have been processed. Great job!</p>
                        </div>
                        <button 
                            onClick={() => setFilter('PENDING')}
                            className="text-primary font-bold hover:underline"
                        >
                            Return to Pending Queue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
