'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Database,
    Play,
    RefreshCcw,
    Activity,
    Link as LinkIcon,
    Server,
    Zap,
    History,
    FileSearch,
    Loader2,
    Plus,
    X,
    Trash2,
    Settings2,
    ExternalLink,
    Search,
    CheckCircle2
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { cn, formatDate } from '@/lib/utils';
import { scraperService, ScrapeJob, ScrapeSource, ReviewStats, StagedExam } from '@/lib/api';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function ScraperPage() {
    const [jobs, setJobs] = useState<ScrapeJob[]>([]);
    const [sources, setSources] = useState<ScrapeSource[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [stagedExams, setStagedExams] = useState<StagedExam[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<ScrapeSource | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [sourceToDelete, setSourceToDelete] = useState<ScrapeSource | null>(null);

    const fetchData = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            else setIsRefreshing(true);

            const [jobsRes, sourcesRes, statsRes, stagedRes] = await Promise.all([
                scraperService.listJobs({ limit: 20 }),
                scraperService.listSources(),
                scraperService.getStats(),
                scraperService.listStagedExams({ limit: 10 })
            ]);
            setJobs(jobsRes.data || []);
            setSources(sourcesRes.data || []);
            setStats(statsRes.data);
            setStagedExams(stagedRes.data || []);
        } catch (error) {
            console.error('Failed to sync scraper data:', error);
            toast.error('Sync failed: Network error or server unavailable');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleTrigger = async (id: string, label: string) => {
        try {
            toast.info(`Manual trigger initiated for: ${label}`);
            await scraperService.triggerScrape(id);
            toast.success(`Success: Scraping job for ${label} is now in queue`);
            fetchData(true);
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Trigger failed: Command rejected by server');
        }
    };

    const handleTriggerAll = async () => {
        const active = sources.filter(s => s.isActive);
        if (active.length === 0) {
            toast.error('Protocol Error: No active sources found to trigger');
            return;
        }

        toast.info(`Batch trigger starting for ${active.length} active vectors...`);
        let successCount = 0;
        for (const source of active) {
            try {
                await scraperService.triggerScrape(source.id);
                successCount++;
            } catch (error) {
                console.error(`Failed: ${source.label}`);
            }
        }

        if (successCount > 0) {
            toast.success(`Batch Success: ${successCount} scraper jobs initiated`);
            fetchData(true);
        } else {
            toast.error('Batch Failure: All triggers were rejected');
        }
    };

    const handleDeleteSource = (source: ScrapeSource) => {
        setSourceToDelete(source);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteSource = async () => {
        if (!sourceToDelete) return;
        try {
            await scraperService.deleteSource(sourceToDelete.id);
            toast.success(`Vector decommissioned: ${sourceToDelete.label}`);
            fetchData(true);
        } catch (error) {
            toast.error('Deletion failed: Source could not be removed from extraction nodes');
        } finally {
            setIsDeleteDialogOpen(false);
            setSourceToDelete(null);
        }
    };

    const handleOpenModal = (source: ScrapeSource | null = null) => {
        setEditingSource(source);
        setIsModalOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none">Success</Badge>;
            case 'RUNNING': return <Badge variant="outline" className="border-primary animate-pulse">Running</Badge>;
            case 'FAILED': return <Badge variant="destructive">Failed</Badge>;
            case 'PARTIAL': return <Badge variant="secondary">Partial</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8 pb-10 max-w-[1400px] mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Scraper Admin</h1>
                    <p className="text-gray-500 mt-1">Manage automated discovery sources and monitor job execution.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fetchData()}
                        disabled={isRefreshing}
                        className={cn(isRefreshing && "animate-spin")}
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleTriggerAll} variant="secondary" className="gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        Execute All
                    </Button>
                    <Button onClick={() => handleOpenModal()} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Provision Source
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sources.filter(s => s.isActive).length} / {sources.length}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-blue-600 font-semibold italic">Discovery vectors online</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Extractions (24h)</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-primary font-semibold italic">Total jobs completed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Review Queue</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.reviewQueue.pending || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-orange-600 font-semibold italic">Awaiting verification</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98.4%</div>
                        <p className="text-xs text-muted-foreground mt-1 text-emerald-600 font-semibold italic">Nominal health</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-8">
                    <Tabs defaultValue="sources" className="w-full flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-4">
                            <TabsList variant="line" className="h-auto p-0 bg-transparent">
                                <TabsTrigger
                                    value="sources"
                                    className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all font-bold text-sm"
                                >
                                    Discovery Vectors
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all font-bold text-sm"
                                >
                                    Execution Logs
                                </TabsTrigger>
                            </TabsList>

                            <div className="relative w-full sm:w-64 sm:ml-auto">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search vectors..."
                                    className="pl-10 h-10 bg-white border-gray-100 rounded-xl focus:ring-primary/20 text-xs font-semibold"
                                />
                            </div>
                        </div>

                        <TabsContent value="sources" className="mt-0 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {loading ? (
                                    [1, 2, 3, 4].map(i => <div key={i} className="h-44 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />)
                                ) : sources.map(source => (
                                    <Card key={source.id} className="group hover:border-primary/40 transition-all shadow-sm rounded-2xl overflow-hidden border-gray-100">
                                        <CardHeader className="pb-4 bg-gray-50/30">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center font-black text-primary italic shrink-0">
                                                        {source.label[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <CardTitle className="text-sm font-black truncate text-gray-900 group-hover:text-primary transition-colors uppercase tracking-tight italic">{source.label}</CardTitle>
                                                        <CardDescription className="text-[10px] font-mono truncate text-gray-400 mt-0.5">{source.url}</CardDescription>
                                                    </div>
                                                </div>
                                                <Badge variant={source.isActive ? "default" : "secondary"} className="text-[9px] uppercase font-black px-2 py-0.5 tracking-tighter shrink-0">
                                                    {source.isActive ? 'Active' : 'Standby'}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="py-5 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="gap-2 h-9 px-4 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10"
                                                            disabled={!source.isActive}
                                                            onClick={() => handleTrigger(source.id, source.label)}
                                                        >
                                                            <Play className="w-3.5 h-3.5 fill-current" />
                                                            Trigger
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Execute Manual Discovery Pulse</TooltipContent>
                                                </Tooltip>

                                                <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-lg border-gray-100" asChild>
                                                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                                                    </a>
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => handleOpenModal(source)}>
                                                    <Settings2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-rose-400 hover:text-white hover:bg-rose-500 transition-all" onClick={() => handleDeleteSource(source)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-0 outline-none">
                            <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-b border-gray-100">
                                            <TableHead className="text-[10px] uppercase font-black tracking-widest text-gray-400 h-12">Vector Source</TableHead>
                                            <TableHead className="text-[10px] uppercase font-black tracking-widest text-gray-400 h-12">Status</TableHead>
                                            <TableHead className="text-[10px] uppercase font-black tracking-widest text-gray-400 h-12">Execution Time</TableHead>
                                            <TableHead className="text-[10px] uppercase font-black tracking-widest text-gray-400 h-12 text-right pr-6">Yield</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            [1, 2, 3, 4, 5, 6].map(i => <TableRow key={i} className="animate-pulse"><TableCell colSpan={4} className="h-16 bg-white border-b border-gray-50" /></TableRow>)
                                        ) : jobs.length > 0 ? jobs.map(job => (
                                            <TableRow key={job.id} className="hover:bg-primary/[0.02] group transition-colors border-b border-gray-50 last:border-0">
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full transition-all group-hover:scale-150",
                                                            job.status === 'COMPLETED' ? "bg-emerald-400" :
                                                                job.status === 'RUNNING' ? "bg-primary animate-pulse" : "bg-rose-400"
                                                        )} />
                                                        <span className="font-bold text-xs text-gray-700 tracking-tight">{job.scrapeSource?.label || 'Decommissioned Vector'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    {getStatusBadge(job.status)}
                                                </TableCell>
                                                <TableCell className="text-[11px] text-gray-400 font-medium py-4">
                                                    {formatDate(job.startedAt)}
                                                </TableCell>
                                                <TableCell className="text-right py-4 pr-6">
                                                    <div className="flex flex-col items-end">
                                                        <span className={cn("font-black text-sm", job.candidatesFound > 0 ? "text-primary italic" : "text-gray-200")}>
                                                            {job.candidatesFound}
                                                        </span>
                                                        <span className="text-[8px] font-black uppercase text-gray-300 tracking-[0.2em] -mt-1 leading-none">Candidates</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-48 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">No execution pulses recorded</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>


                {/* Sidebar Column: Staged Vault */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-orange-100 shadow-sm bg-orange-50/10">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-600">
                                    <Database className="w-4 h-4" />
                                    Staged Entries
                                </CardTitle>
                                <Badge variant="outline" className="bg-white border-orange-200 text-orange-600 font-bold uppercase text-[9px]">
                                    {stagedExams.length} Urgent
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)
                            ) : stagedExams.length > 0 ? stagedExams.map(staged => (
                                <div key={staged.id} className="bg-white border border-gray-100 rounded-xl p-3 hover:border-orange-300 hover:shadow-md transition-all group cursor-pointer flex items-center justify-between">
                                    <div className="min-w-0 pr-4">
                                        <p className="text-xs font-bold text-gray-900 truncate uppercase tracking-tight">{staged.title || 'Untitled Discovery'}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] text-gray-400 font-medium italic">{formatDate(staged.createdAt)}</span>
                                        </div>
                                    </div>
                                    <FileSearch className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vault Nominal</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="ghost" className="w-full text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-bold uppercase tracking-widest h-10 border-t border-orange-50/50 rounded-none" asChild>
                                <Link href="/review">
                                    Open Full Triage Queue
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Operational Protocols */}
                    <Card className="bg-slate-900 text-white border-none py-2 overflow-hidden relative">
                        <Zap className="absolute top-0 right-0 w-32 h-32 text-white opacity-5 -translate-y-8 translate-x-8" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-black tracking-tight uppercase italic flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary" />
                                Protocols
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2">
                            <p className="text-xs text-slate-400 leading-relaxed font-semibold">Discovery engine active. Candidates polling at Layer 4 frequency.</p>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-2">
                                    <span>Uptime</span>
                                    <span className="text-emerald-400">99.9% Nominal</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-2">
                                    <span>Throughput</span>
                                    <span className="text-primary italic">2.4k Candidates / Hr</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    <span>Pulse</span>
                                    <span className="text-slate-300 underline font-mono">1.2ms latency</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Source Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <SourceModal
                        source={editingSource}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={async (data) => {
                            try {
                                if (editingSource) {
                                    await scraperService.updateSource(editingSource.id, data);
                                    toast.success('Configuration updated successfuly');
                                } else {
                                    await scraperService.createSource(data);
                                    toast.success('Discovery vector provisioned successfully');
                                }
                                setIsModalOpen(false);
                                fetchData(true);
                            } catch (error) {
                                toast.error('Fatal Protocol Error: Operation could not be completed');
                            }
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Deletion Pulse Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                    <AlertDialogHeader className="p-8 bg-rose-500 text-white">
                        <AlertDialogTitle className="text-2xl font-black uppercase italic tracking-tighter">Decommission Vector?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/80 text-[10px] font-black uppercase tracking-widest mt-1">
                            Critical intelligence pipeline teardown
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="p-8 space-y-4 bg-white">
                        <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-tight">
                            You are about to decommission <span className="text-rose-600 font-black italic">{sourceToDelete?.label}</span>.
                            This will permanently remove the extraction node from the polling cluster.
                            This operation cannot be reversed.
                        </p>
                        <AlertDialogFooter className="pt-4 flex gap-3 sm:gap-2">
                            <AlertDialogCancel className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-gray-100 hover:bg-gray-50">Abort</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDeleteSource} className="flex-[2] h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200">Decommission</AlertDialogAction>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}


function SourceModal({ source, isOpen, onClose, onSave }: { source: ScrapeSource | null, isOpen: boolean, onClose: () => void, onSave: (data: any) => Promise<void> }) {
    const [label, setLabel] = useState(source?.label || '');
    const [url, setUrl] = useState(source?.url || '');
    const [sourceType, setSourceType] = useState<'LISTING' | 'DETAIL'>(source?.sourceType || 'LISTING');
    const [hintCategory, setHintCategory] = useState(source?.hintCategory || 'GLOBAL');
    const [isActive, setIsActive] = useState(source ? source.isActive : true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        { id: 'GLOBAL', label: 'Global Discovery (Default)' },
        { id: 'GOVERNMENT_JOBS', label: 'Government Central/State' },
        { id: 'BANKING_JOBS', label: 'Banking & Financial' },
        { id: 'RAILWAY_JOBS', label: 'Railway Recruitment' },
        { id: 'DEFENCE_JOBS', label: 'Defence & Security' },
        { id: 'POLICE_JOBS', label: 'Police Force' },
        { id: 'UPSC', label: 'Union Public Service' },
        { id: 'SSC', label: 'Staff Selection' },
        { id: 'STATE_PSC', label: 'State Commission' },
        { id: 'TEACHING_ELIGIBILITY', label: 'Teaching & Academia' },
        { id: 'ENGINEERING_ENTRANCE', label: 'Engineering Professional' },
        { id: 'MEDICAL_ENTRANCE', label: 'Medical Entrance' },
        { id: 'OTHER', label: 'Miscellaneous' },
    ];

    const handleFormSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave({ label, url, sourceType, hintCategory: hintCategory === 'GLOBAL' ? undefined : hintCategory, isActive });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
                <DialogHeader className="p-8 bg-slate-900 text-white">
                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">
                        {source ? 'Configure Vector' : 'Provision Vector'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Advanced extraction module v4.2
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFormSave} className="p-8 space-y-6 bg-white">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="label" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Label Identifier</Label>
                            <Input
                                id="label"
                                required
                                value={label}
                                onChange={e => setLabel(e.target.value)}
                                placeholder="e.g. UPSC Official Portal"
                                className="h-12 rounded-xl focus:ring-primary font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Source Point (URL)</Label>
                            <Input
                                id="url"
                                required
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="https://..."
                                className="h-12 rounded-xl focus:ring-primary font-bold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Strategy Mode</Label>
                            <Select value={sourceType} onValueChange={(val: any) => setSourceType(val)}>
                                <SelectTrigger className="h-12 rounded-xl font-bold">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="LISTING" className="font-bold">Index/Listing</SelectItem>
                                    <SelectItem value="DETAIL" className="font-bold">Deep/Single</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Intel Category</Label>
                            <Select value={hintCategory} onValueChange={setHintCategory}>
                                <SelectTrigger className="h-12 rounded-xl font-bold">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id} className="font-bold text-xs uppercase">{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="space-y-0.5">
                            <Label className="text-[11px] font-black uppercase tracking-widest block italic leading-none">Automated Polling</Label>
                            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-tighter">Toggle global activity pulse</span>
                        </div>
                        <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-primary" />
                    </div>

                    <DialogFooter className="pt-4 flex gap-3 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-12 uppercase tracking-widest text-[10px] font-black">Abort</Button>
                        <Button type="submit" disabled={isSubmitting} className="flex-[2] rounded-xl h-12 uppercase tracking-[0.2em] text-[10px] font-black shadow-lg shadow-primary/20">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : source ? 'Update Config' : 'Release Vector'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
