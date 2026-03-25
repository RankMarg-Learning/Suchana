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
    MessageSquare,
    Users,
    ChevronRight,
    RefreshCcw,
    Check,
    X,
    Filter,
    MoreHorizontal
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { scraperService, StagedExam, ReviewStats } from '@/lib/api';
import { toast } from 'sonner';

// Shadcn UI Imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ReviewFilter = 'PENDING' | 'NEEDS_CORRECTION' | 'APPROVED' | 'REJECTED' | 'ALL';

const STATUS_THEME: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock },
    NEEDS_CORRECTION: { label: 'Needs Fix', color: 'text-orange-600 bg-orange-50 border-orange-100', icon: AlertTriangle },
    APPROVED: { label: 'Approved', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 },
    REJECTED: { label: 'Rejected', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: XCircle },
};

export default function ReviewQueuePage() {
    const [stagedExams, setStagedExams] = useState<StagedExam[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<ReviewFilter>('PENDING');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState<ReviewStats['reviewQueue'] | null>(null);
    
    const [selectedExam, setSelectedExam] = useState<StagedExam | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isRawOpen, setIsRawOpen] = useState(false);
    
    const [decisionDialog, setDecisionDialog] = useState<{
        isOpen: boolean;
        exam: StagedExam | null;
        decision: 'APPROVED' | 'REJECTED' | 'NEEDS_CORRECTION' | null;
    }>({ isOpen: false, exam: null, decision: null });
    
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
            toast.error('Failed to sync queue');
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
                toast.success(`${exam.title} ${decision.toLowerCase()}`);
                setDecisionDialog({ isOpen: false, exam: null, decision: null });
                fetchStaged(true);
            } else {
                toast.error(res.error?.message || 'Action failed');
            }
        } catch (error: any) {
            toast.error('Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredExams = stagedExams.filter(exam => 
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.conductingBody?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Simple Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-outfit text-slate-900 tracking-tight">Review Queue</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage and approve crawled exam data for the platform.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => fetchStaged()} className="h-9 gap-2">
                        <RefreshCcw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <Tabs defaultValue="PENDING" onValueChange={(val) => setFilter(val as ReviewFilter)} className="w-auto">
                    <TabsList className="bg-slate-50 p-1 rounded-xl h-10">
                        <TabsTrigger value="PENDING" className="text-xs px-4 rounded-lg">Pending ({stats?.pending || 0})</TabsTrigger>
                        <TabsTrigger value="NEEDS_CORRECTION" className="text-xs px-4 rounded-lg">Flagged ({stats?.needsCorrection || 0})</TabsTrigger>
                        <TabsTrigger value="APPROVED" className="text-xs px-4 rounded-lg">Approved</TabsTrigger>
                        <TabsTrigger value="ALL" className="text-xs px-4 rounded-lg">All</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search items..." 
                        className="pl-10 h-10 border-slate-200 rounded-xl text-sm"
                    />
                </div>
            </div>

            {/* List Content */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
                </div>
            ) : filteredExams.length > 0 ? (
                <div className="space-y-4">
                    {filteredExams.map((staged) => {
                        const status = STATUS_THEME[staged.reviewStatus] || STATUS_THEME.PENDING;
                        return (
                            <Card key={staged.id} className="group hover:border-indigo-200 hover:shadow-md transition-all rounded-2xl border-slate-100">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                            <FileText className="w-6 h-6 text-slate-400" />
                                        </div>
                                        
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-slate-900 truncate">{staged.title}</h3>
                                                <div className={cn("px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-tight", status.color)}>
                                                    {status.label}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1.5 font-bold text-slate-700">
                                                    {staged.conductingBody}
                                                </span>
                                                <Separator orientation="vertical" className="h-3 shadow-none" />
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {staged.totalVacancies || '---'} Vacancies
                                                </span>
                                                <Separator orientation="vertical" className="h-3 shadow-none" />
                                                <span>Crawl: {staged.scrapedAt ? formatDate(staged.scrapedAt).split(',')[0] : '---'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {filter === 'PENDING' || filter === 'NEEDS_CORRECTION' ? (
                                                <>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        className="h-9 px-4 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-bold gap-2 rounded-xl"
                                                        onClick={() => openDecision(staged, 'APPROVED')}
                                                    >
                                                        <Check className="w-4 h-4 text-emerald-500" />
                                                        Approve
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                                                        onClick={() => openDecision(staged, 'REJECTED')}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            ) : null}
                                            
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 rounded-xl">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border-slate-100">
                                                    <DropdownMenuItem className="text-xs font-medium gap-2 py-2" onClick={() => { setSelectedExam(staged); setIsPreviewOpen(true); }}>
                                                        <Eye className="w-3 h-3" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-xs font-medium gap-2 py-2" onClick={() => openDecision(staged, 'NEEDS_CORRECTION')}>
                                                        <AlertTriangle className="w-3 h-3" /> Flag for Fix
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-xs font-medium gap-2 py-2 font-mono" onClick={() => { setSelectedExam(staged); setIsRawOpen(true); }}>
                                                        <Terminal className="w-3 h-3" /> Raw JSON
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">Queue is empty</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                        No items found matching the current filter.
                    </p>
                </div>
            )}

            {/* Decision Dialog */}
            <Dialog open={decisionDialog.isOpen} onOpenChange={(open) => !open && setDecisionDialog(prev => ({ ...prev, isOpen: false }))}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold font-outfit">
                            {decisionDialog.decision === 'APPROVED' ? 'Finalize & Publish' : decisionDialog.decision === 'REJECTED' ? 'Discard Entry' : 'Flag for Correction'}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Confirm your decision for: <span className="font-bold text-slate-900">{decisionDialog.exam?.title}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {decisionDialog.decision === 'APPROVED' && (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Title</label>
                                    <Input 
                                        value={verifiedTitle} 
                                        onChange={(e) => setVerifiedTitle(e.target.value)}
                                        className="h-10 rounded-xl text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Conducting Body</label>
                                    <Input 
                                        value={verifiedBody} 
                                        onChange={(e) => setVerifiedBody(e.target.value)}
                                        className="h-10 rounded-xl text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                {decisionDialog.decision === 'APPROVED' ? 'Review Notes (Optional)' : 'Reason for Decision'}
                            </label>
                            <Textarea 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add any final observations..."
                                className="min-h-[100px] rounded-xl text-sm resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDecisionDialog(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
                        <Button 
                            className={cn(
                                "rounded-xl px-6 h-10",
                                decisionDialog.decision === 'APPROVED' ? "bg-emerald-600 hover:bg-emerald-700" : decisionDialog.decision === 'REJECTED' ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700 text-white"
                            )}
                            onClick={handleReviewSubmit}
                            disabled={submitting}
                        >
                            {submitting ? "Processing..." : "Confirm Action"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Preview */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden">
                    <DialogHeader className="p-6 bg-slate-900 text-white border-none">
                        <DialogTitle className="text-xl font-bold font-outfit">Review Details</DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs">{selectedExam?.title}</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                        <div className="p-6 space-y-8">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Timeline Preview</h4>
                                <div className="space-y-2">
                                    {selectedExam?.stagedEvents?.map((event, idx) => (
                                        <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-bold uppercase text-slate-400">{event.stage}</p>
                                                <p className="text-sm font-bold text-slate-900">{event.title}</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500">{event.startsAt ? formatDate(event.startsAt).split(',')[0] : 'TBD'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Posts</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedExam?.totalVacancies || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Category</p>
                                    <Badge variant="secondary" className="mt-1 bg-white border-slate-200 text-slate-600">{selectedExam?.category || 'General'}</Badge>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">AI Analysis Note</p>
                                <div className="p-4 rounded-xl bg-indigo-50/50 text-indigo-900 text-sm leading-relaxed border border-indigo-100/50">
                                    {selectedExam?.aiNotes || 'No specific notes for this item.'}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t border-slate-50 flex justify-end">
                        <Button className="rounded-xl h-10 px-8" onClick={() => setIsPreviewOpen(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Raw JSON Preview */}
            <Dialog open={isRawOpen} onOpenChange={setIsRawOpen}>
                <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden bg-slate-950">
                    <DialogHeader className="p-6 border-b border-white/5">
                        <DialogTitle className="text-white font-mono text-sm flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-emerald-400" /> RAW_DATA.JSON
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[400px] p-6">
                        <pre className="text-[11px] font-mono text-emerald-400/80 leading-relaxed">
                            {JSON.stringify(selectedExam, null, 4)}
                        </pre>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Support icons missing from bulk import
function FileText(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
        </svg>
    )
}

