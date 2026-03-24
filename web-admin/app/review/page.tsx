'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    Search, 
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    Clock, 
    Terminal,
    Eye,
    Zap,
    MessageSquare,
    Activity,
    UserCircle2,
    Calendar,
    Users,
    GitMerge,
    Rocket,
    Info,
    ArrowRight
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { scraperService, StagedExam, ReviewStats } from '@/lib/api';
import { toast } from 'sonner';

// Shadcn UI Imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type ReviewFilter = 'PENDING' | 'NEEDS_CORRECTION' | 'APPROVED' | 'REJECTED' | 'ALL';

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    NEEDS_CORRECTION: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle },
    APPROVED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
    REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle },
};

export default function ReviewQueuePage() {
    const [stagedExams, setStagedExams] = useState<StagedExam[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<ReviewFilter>('PENDING');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState<ReviewStats['reviewQueue'] | null>(null);
    
    // View/Action States
    const [selectedExam, setSelectedExam] = useState<StagedExam | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isRawOpen, setIsRawOpen] = useState(false);
    
    // Review Decision State
    const [decisionDialog, setDecisionDialog] = useState<{
        isOpen: boolean;
        exam: StagedExam | null;
        decision: 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION' | null;
    }>({ isOpen: false, exam: null, decision: null });
    
    // Correction/Verify States
    const [note, setNote] = useState('');
    const [verifiedTitle, setVerifiedTitle] = useState('');
    const [verifiedBody, setVerifiedBody] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const res = await scraperService.getStats();
            setStats(res.data.reviewQueue);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }, []);

    const fetchStaged = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const params: any = { isDuplicate: false };
            if (filter !== 'ALL') params.status = filter;
            const res = await scraperService.listStagedExams(params);
            setStagedExams(res.data || []);
            fetchStats();
        } catch (error) {
            console.error('Failed to fetch staged exams:', error);
            toast.error('Sync error: Failed to retrieve intelligence queue');
        } finally {
            setLoading(false);
        }
    }, [filter, fetchStats]);

    useEffect(() => {
        fetchStaged();
    }, [fetchStaged]);

    const openDecision = (exam: StagedExam, decision: 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION') => {
        setDecisionDialog({ isOpen: true, exam, decision });
        setNote('');
        setVerifiedTitle(exam.title || '');
        setVerifiedBody(exam.conductingBody || '');
    };

    const handleReviewSubmit = async () => {
        const { exam, decision } = decisionDialog;
        if (!exam || !decision) return;

        setSubmitting(true);
        try {
            const corrections: any = {};
            if (decision === 'APPROVED') {
                if (verifiedTitle !== exam.title) corrections.title = verifiedTitle;
                if (verifiedBody !== exam.conductingBody) corrections.conductingBody = verifiedBody;
            }

            const res = await scraperService.reviewStagedExam(
                exam.id, 
                decision, 
                note || undefined, 
                Object.keys(corrections).length ? corrections : undefined
            );

            if (res.success) {
                toast.success(`Review Recorded: ${exam.title} has been ${decision.toLowerCase()}`);
                setDecisionDialog({ isOpen: false, exam: null, decision: null });
                fetchStaged(true);
            } else {
                toast.error(res.error?.message || 'Review failed');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredExams = stagedExams.filter(exam => 
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.conductingBody?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-[1600px] mx-auto pb-20 px-4">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-6 bg-primary rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                        <h1 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 font-outfit">Intelligence Vault</h1>
                    </div>
                    <h2 className="text-5xl font-black tracking-tight text-gray-900 drop-shadow-sm italic uppercase font-outfit">Review Queue</h2>
                    <p className="text-gray-500 font-bold text-base flex items-center gap-2 mt-2">
                        Currently processing <span className="text-black italic font-black h-7 px-2 bg-primary/10 rounded flex items-center">{stats?.pending || 0}</span> candidates in active triage.
                    </p>
                </div>
                
                <div className="grid grid-cols-2 lg:flex items-center gap-3">
                    <Card className="bg-slate-900 text-white border-none py-3 px-6 flex items-center gap-4 shadow-xl rounded-2xl">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fix Required</span>
                            <span className="text-sm font-black text-amber-500 italic">{stats?.needsCorrection || 0}</span>
                        </div>
                        <Separator orientation="vertical" className="h-8 bg-slate-800" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Promotions</span>
                            <span className="text-sm font-black text-emerald-400 italic">{stats?.approved || 0}</span>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Filter Section */}
            <Tabs defaultValue="PENDING" onValueChange={(val) => setFilter(val as ReviewFilter)} className="w-full">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-0">
                    <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start overflow-x-auto no-scrollbar">
                        {[
                            { value: 'PENDING', label: 'Queued', icon: Clock, count: stats?.pending },
                            { value: 'NEEDS_CORRECTION', label: 'Fixes', icon: AlertTriangle, count: stats?.needsCorrection },
                            { value: 'APPROVED', label: 'Approved', icon: CheckCircle2, count: stats?.approved },
                            { value: 'REJECTED', label: 'Discarded', icon: XCircle, count: stats?.rejected },
                            { value: 'ALL', label: 'All Intel', icon: Info, count: null },
                        ].map((tab) => (
                            <TabsTrigger 
                                key={tab.value}
                                value={tab.value}
                                className="px-1 py-4 rounded-none border-b-4 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-black transition-all font-black text-xs uppercase tracking-[0.2em] relative whitespace-nowrap"
                            >
                                <tab.icon className="w-3.5 h-3.5 mr-2 opacity-30 group-data-[state=active]:opacity-100" />
                                {tab.label}
                                {tab.count !== undefined && tab.count !== null && (
                                    <Badge className="ml-2 bg-slate-100 text-slate-600 border-none text-[8px] px-1 h-4 min-w-[1rem] flex items-center justify-center font-black">
                                        {tab.count}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="relative w-full lg:w-96 mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, organization or category..." 
                            className="pl-10 h-11 bg-white border-gray-100 rounded-2xl focus:ring-primary/20 text-xs font-bold shadow-sm"
                        />
                    </div>
                </div>

                <TabsContent value={filter} className="mt-8">
                    {loading ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Card key={i} className="rounded-3xl border-gray-100 shadow-sm overflow-hidden h-[450px]">
                                    <div className="p-8 space-y-6">
                                        <div className="flex gap-6">
                                            <Skeleton className="w-20 h-20 rounded-2xl" />
                                            <div className="flex-1 space-y-3">
                                                <Skeleton className="h-8 w-3/4 rounded-lg" />
                                                <Skeleton className="h-4 w-1/2 rounded-md" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-32 w-full rounded-2xl" />
                                        <div className="grid grid-cols-2 gap-4">
                                             <Skeleton className="h-12 w-full rounded-xl" />
                                             <Skeleton className="h-12 w-full rounded-xl" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : filteredExams.length > 0 ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                            {filteredExams.map((staged) => {
                                const status = STATUS_CONFIG[staged.reviewStatus] || STATUS_CONFIG.PENDING;
                                return (
                                    <Card key={staged.id} className="group relative border-gray-100 rounded-[2.5rem] overflow-hidden hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 bg-white flex flex-col h-full">
                                        {/* AI Confidence Strip */}
                                        <div className={cn(
                                            "absolute top-0 right-0 left-0 h-1.5 transition-all duration-500",
                                            (staged.aiConfidence || 0) > 0.8 ? "bg-emerald-400" : (staged.aiConfidence || 0) > 0.6 ? "bg-amber-400" : "bg-rose-400"
                                        )} />

                                        <CardHeader className="p-8 pb-4 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-3xl text-primary italic shadow-sm group-hover:scale-110 transition-transform duration-500">
                                                        {staged.shortTitle?.[0] || staged.title[0]}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <h3 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight italic group-hover:text-primary transition-colors pr-10 line-clamp-2">{staged.title}</h3>
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-tighter", status.bg, status.text, status.border)}>
                                                                <status.icon className="w-2.5 h-2.5" />
                                                                {staged.reviewStatus}
                                                            </div>
                                                            {staged.isDuplicate && (
                                                                <Badge className="bg-rose-100 text-rose-600 border-none text-[8px] font-black uppercase italic tracking-tighter">Collision</Badge>
                                                            )}
                                                            {staged.existingExamId && !staged.isDuplicate && (
                                                                <Badge className="bg-indigo-100 text-indigo-600 border-none text-[8px] font-black uppercase italic tracking-tighter">Update</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute top-8 right-8">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1">Confidence</span>
                                                                    <div className={cn(
                                                                        "text-lg font-black italic tabular-nums leading-none",
                                                                        (staged.aiConfidence || 0) > 0.8 ? "text-emerald-500" : (staged.aiConfidence || 0) > 0.6 ? "text-amber-500" : "text-rose-500"
                                                                    )}>
                                                                        {Math.round((staged.aiConfidence || 0) * 100)}%
                                                                    </div>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>AI Extraction Precision Score</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="p-8 pt-0 space-y-6 flex-1">
                                            {/* Entity Info */}
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] uppercase">
                                                    {staged.category?.replace(/_/g, ' ') || 'GENERAL'}
                                                </Badge>
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-[10px] font-bold text-gray-500 border border-gray-100">
                                                    <Users className="w-3 h-3" />
                                                    {staged.totalVacancies || '---'} Posts
                                                </div>
                                                {staged.sourceCount > 1 && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-[10px] font-bold text-primary border border-primary/10">
                                                        <GitMerge className="w-3 h-3" />
                                                        {staged.sourceCount} Sources
                                                    </div>
                                                )}
                                            </div>

                                            {/* Timeline Preview (Mobile Feature Replicated) */}
                                            {staged.stagedEvents && staged.stagedEvents.length > 0 && (
                                                <div className="bg-slate-50/50 rounded-2xl p-5 space-y-3 border border-slate-100">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-slate-400 italic uppercase tracking-widest">Timeline Preview</span>
                                                        <span className="text-[10px] font-bold text-slate-400">{staged.stagedEvents.length} Events</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {staged.stagedEvents.slice(0, 3).map((event, idx) => (
                                                            <div key={idx} className="flex items-start justify-between gap-4">
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">{event.stage}</span>
                                                                    <span className="text-xs font-black text-slate-700 truncate italic">{event.title}</span>
                                                                </div>
                                                                <span className="text-[10px] font-black text-slate-500 whitespace-nowrap pt-1 italic">
                                                                    {event.isTBD ? 'TBD' : event.startsAt ? formatDate(event.startsAt).split(',')[0] : '---'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {staged.stagedEvents.length > 3 && (
                                                            <div className="flex items-center gap-1 text-[10px] font-black text-primary italic pt-1">
                                                                <ArrowRight className="w-3 h-3" />
                                                                +{staged.stagedEvents.length - 3} more lifecycle updates
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="text-[11px] text-gray-400 font-medium italic mt-auto">
                                                Via {staged.scrapeJob?.scrapeSource?.label || 'Manual Source'} · {staged.scrapedAt ? formatDate(staged.scrapedAt) : 'Recent'}
                                            </div>
                                        </CardContent>

                                        <CardFooter className="p-8 pt-0 gap-3 border-t border-gray-50 bg-gray-50/10 mt-2">
                                            <div className="flex w-full flex-col pt-6 gap-6">
                                                <div className="flex items-center gap-3">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="h-11 flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white shadow-sm border-slate-200"
                                                        onClick={() => { setSelectedExam(staged); setIsPreviewOpen(true); }}
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Details
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="icon" 
                                                        className="h-11 w-11 rounded-xl text-slate-400 border-slate-200"
                                                        onClick={() => { setSelectedExam(staged); setIsRawOpen(true); }}
                                                    >
                                                        <Terminal className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                
                                                {filter === 'PENDING' || filter === 'NEEDS_CORRECTION' ? (
                                                    <div className="flex items-center gap-3">
                                                        <Button 
                                                            variant="ghost" 
                                                            className="h-12 w-12 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                                                            onClick={() => openDecision(staged, 'REJECTED')}
                                                        >
                                                            <XCircle className="w-6 h-6" />
                                                        </Button>
                                                        <Button 
                                                            variant="secondary"
                                                            className="h-12 w-12 text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-2xl transition-all border border-amber-100"
                                                            onClick={() => openDecision(staged, 'NEEDS_CORRECTION')}
                                                        >
                                                            <AlertTriangle className="w-6 h-6" />
                                                        </Button>
                                                        <Button 
                                                            className="h-12 flex-1 rounded-[1.2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 italic group"
                                                            onClick={() => openDecision(staged, 'APPROVED')}
                                                        >
                                                            <Rocket className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                                                            Publish
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="py-2 flex items-center justify-center italic text-xs font-black text-slate-300 uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl">
                                                        Finalized Stage
                                                    </div>
                                                )}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm">
                            <div className="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center shadow-inner mb-8 group overflow-hidden relative">
                                <Search className="w-12 h-12 text-slate-200 transition-all duration-700 group-hover:scale-150 rotate-[-12deg]" />
                            </div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900 drop-shadow-sm mb-2">Vault Nominal</h3>
                            <p className="text-gray-400 font-bold max-w-sm leading-relaxed text-sm">
                                Intelligence release synchronization complete. Currently no candidates awaiting triage in the <span className="text-primary italic font-black uppercase tracking-widest">{filter}</span> sector.
                            </p>
                            <Button 
                                variant="outline" 
                                className="mt-10 h-10 rounded-xl px-10 font-black uppercase tracking-widest text-xs border-gray-200 hover:text-primary transition-all shadow-sm"
                                onClick={() => setFilter('PENDING')}
                            >
                                Re-Index Queue
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Decision Dialog (Mobile logic ported to Web) */}
            <Dialog open={decisionDialog.isOpen} onOpenChange={(open) => !open && setDecisionDialog(prev => ({ ...prev, isOpen: false }))}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                    <DialogHeader className={cn(
                        "p-8 text-white",
                        decisionDialog.decision === 'APPROVED' ? "bg-emerald-600" : decisionDialog.decision === 'REJECTED' ? "bg-rose-600" : "bg-amber-600"
                    )}>
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {decisionDialog.decision === 'APPROVED' ? <Rocket className="w-6 h-6" /> : decisionDialog.decision === 'REJECTED' ? <XCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                                {decisionDialog.decision === 'APPROVED' ? 'Final Polish & Promotion' : decisionDialog.decision === 'REJECTED' ? 'Confirm Discard' : 'Flag for Correction'}
                            </div>
                        </DialogTitle>
                        <DialogDescription className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-1">
                            Actioning: {decisionDialog.exam?.title}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] p-8">
                        <div className="space-y-6">
                            {decisionDialog.decision === 'APPROVED' && (
                                <>
                                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                                        <div className="bg-emerald-500 rounded-full p-2"><Rocket className="w-4 h-4 text-white" /></div>
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-black text-emerald-900 uppercase italic">Live Promotion Impact</h4>
                                            <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">This will publish the exam directly {decisionDialog.exam?.existingExamId ? 'and update the existing record.' : 'as a new entry.'} Ensure title and body are verified.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400">Verify Final Title</label>
                                            <Input 
                                                value={verifiedTitle} 
                                                onChange={(e) => setVerifiedTitle(e.target.value)}
                                                className="border-gray-100 rounded-xl font-bold bg-slate-50 focus:bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400">Verify Conducting Body</label>
                                            <Input 
                                                value={verifiedBody} 
                                                onChange={(e) => setVerifiedBody(e.target.value)}
                                                className="border-gray-100 rounded-xl font-bold bg-slate-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {decisionDialog.decision === 'REJECTED' && (
                                <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 flex items-start gap-4">
                                    <div className="bg-rose-500 rounded-full p-2"><XCircle className="w-4 h-4 text-white" /></div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-black text-rose-900 uppercase italic">Discarding Intelligence</h4>
                                        <p className="text-[11px] text-rose-700 leading-relaxed font-medium">Rejecting this candidate will remove it from the triage queue permanently. Please state a reason below for audit trails.</p>
                                    </div>
                                </div>
                            )}

                            {decisionDialog.decision === 'NEEDS_CORRECTION' && (
                                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                                    <div className="bg-amber-500 rounded-full p-2"><AlertTriangle className="w-4 h-4 text-white" /></div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-black text-amber-900 uppercase italic">Requesting Manual Patch</h4>
                                        <p className="text-[11px] text-amber-700 leading-relaxed font-medium">This will flag the candidate for correction. Be specific about what info is missing or inaccurate.</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2 pt-2">
                                <label className="text-[10px] font-black uppercase text-gray-400">
                                    {decisionDialog.decision === 'APPROVED' ? 'Final Admin Notes (Optional)' : 'Reason / Feedback *'}
                                </label>
                                <Textarea 
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder={decisionDialog.decision === 'APPROVED' ? "Any internal deployment notes..." : "Enter reason for this decision..."}
                                    className="min-h-[120px] rounded-2xl border-gray-100 font-medium"
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="p-8 pt-4">
                        <Button variant="ghost" onClick={() => setDecisionDialog(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
                        <Button 
                            className={cn(
                                "rounded-xl px-12 font-black uppercase tracking-widest text-xs h-12",
                                decisionDialog.decision === 'APPROVED' ? "bg-emerald-600 hover:bg-emerald-700" : decisionDialog.decision === 'REJECTED' ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700 text-white"
                            )}
                            onClick={handleReviewSubmit}
                            disabled={submitting}
                        >
                            {submitting ? "Processing..." : "Confirm Decision"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Inspect Dialogs (Keep existing previews) */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                    <DialogHeader className="p-8 bg-slate-900 text-white">
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                            <Activity className="w-6 h-6 text-primary" />
                            Entity Triage: {selectedExam?.title}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                            Neural Pipeline Verification Stage
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] p-8">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    Candidate Milestones
                                </h4>
                                <div className="space-y-3">
                                    {selectedExam?.stagedEvents?.map((event, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-slate-50/30 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-tight text-slate-400 italic">{event.stage}</p>
                                                <p className="text-xs font-black text-slate-900 italic">{event.title}</p>
                                                <p className="text-[10px] font-bold text-slate-500">{event.startsAt ? formatDate(event.startsAt) : 'Scheduled Date Pending'}</p>
                                            </div>
                                            <Badge className="bg-white border-slate-100 text-slate-400 font-black text-[9px] uppercase italic tracking-tighter">Order {event.stageOrder}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <Separator className="bg-gray-100" />

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Metadata Yield</p>
                                    <div className="flex items-center gap-2">
                                        <UserCircle2 className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-black italic">{selectedExam?.totalVacancies || 'Verification Needed'} Posts</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Category Alignment</p>
                                    <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase italic">{selectedExam?.category || 'General'}</Badge>
                                </div>
                            </div>

                            <Separator className="bg-gray-100" />

                            <div className="space-y-2">
                                <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none">Scraper Intelligence Note</p>
                                <div className="p-5 rounded-2xl bg-slate-50 italic text-slate-600 text-xs leading-relaxed font-medium">
                                    "{selectedExam?.aiNotes || 'Automated candidate summary pending final verification.'}"
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="p-8 pt-0 flex justify-end">
                        <Button className="h-10 rounded-xl px-12 font-black uppercase tracking-widest text-xs" onClick={() => setIsPreviewOpen(false)}>Close Inspector</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Raw Data Dialog */}
            <Dialog open={isRawOpen} onOpenChange={setIsRawOpen}>
                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                    <DialogHeader className="p-8 bg-slate-900 text-white">
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                            <Terminal className="w-6 h-6 text-emerald-400" />
                            Raw Intelligence Node
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                            Unfiltered scraper payload v4.2
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-8 bg-black">
                        <ScrollArea className="h-[400px] rounded-xl border border-slate-800 p-4 bg-slate-950">
                            <pre className="text-[11px] font-mono text-emerald-400/90 leading-normal whitespace-pre-wrap">
                                {JSON.stringify(selectedExam, null, 4)}
                            </pre>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
