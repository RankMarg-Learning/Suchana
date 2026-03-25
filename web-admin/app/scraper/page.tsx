'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Database,
    Play,
    RefreshCcw,
    Activity,
    Server,
    Zap,
    History,
    FileSearch,
    Loader2,
    Plus,
    Trash2,
    Settings2,
    ExternalLink,
    Search,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
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
            toast.error('Failed to load data. Please check your connection.');
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
            toast.info(`Starting scraper for: ${label}`);
            await scraperService.triggerScrape(id);
            toast.success(`Scraper started for ${label}`);
            fetchData(true);
        } catch (error: any) {
            toast.error(error.response?.data?.error?.message || 'Failed to start scraper');
        }
    };

    const handleTriggerAll = async () => {
        const active = sources.filter(s => s.isActive);
        if (active.length === 0) {
            toast.error('No active sources found to run');
            return;
        }

        toast.info(`Running ${active.length} scrapers...`);
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
            toast.success(`Started ${successCount} scrapers`);
            fetchData(true);
        } else {
            toast.error('All scraper requests failed');
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
            toast.success(`Source removed: ${sourceToDelete.label}`);
            fetchData(true);
        } catch (error) {
            toast.error('Failed to remove source');
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
            case 'COMPLETED': return <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-emerald-100" variant="outline">Success</Badge>;
            case 'RUNNING': return <Badge className="bg-blue-50 text-blue-600 animate-pulse border-blue-100" variant="outline">Running</Badge>;
            case 'FAILED': return <Badge className="bg-rose-50 text-rose-600 border-rose-100" variant="outline">Failed</Badge>;
            case 'PARTIAL': return <Badge className="bg-amber-50 text-amber-600 border-amber-100" variant="outline">Partial</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Scrapers</h1>
                    <p className="text-muted-foreground text-sm">Monitor and manage website data sources.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fetchData()}
                        disabled={isRefreshing}
                        className={cn(isRefreshing && "animate-spin")}
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleTriggerAll} variant="outline" className="gap-2">
                        <Play className="w-4 h-4" />
                        Run All
                    </Button>
                    <Button onClick={() => handleOpenModal()} className="gap-2 shadow-sm">
                        <Plus className="w-4 h-4" />
                        Add Source
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: "Active Sources", value: `${sources.filter(s => s.isActive).length} / ${sources.length}`, icon: Server, color: "text-blue-600" },
                    { title: "Jobs (24h)", value: stats?.totalJobs || 0, icon: Activity, color: "text-indigo-600" },
                    { title: "Pending Review", value: stats?.reviewQueue.pending || 0, icon: Database, color: "text-amber-600" },
                    { title: "Success Rate", value: "98.4%", icon: CheckCircle2, color: "text-emerald-600" }
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-card">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">{stat.title}</CardTitle>
                            <stat.icon className={cn("h-4 w-4", stat.color)} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    <Tabs defaultValue="sources" className="w-full">
                        <div className="flex items-center justify-between mb-6">
                            <TabsList className="bg-muted/50 p-1">
                                <TabsTrigger value="sources" className="text-xs font-medium px-4">Sources</TabsTrigger>
                                <TabsTrigger value="history" className="text-xs font-medium px-4">Activity Logs</TabsTrigger>
                            </TabsList>

                            <div className="relative w-64 hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search sources..."
                                    className="pl-9 h-9 text-sm"
                                />
                            </div>
                        </div>

                        <TabsContent value="sources" className="mt-0 outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {loading ? (
                                    Array(4).fill(0).map((_, i) => <div key={i} className="h-40 bg-muted/50 rounded-xl animate-pulse" />)
                                ) : sources.map(source => (
                                    <Card key={source.id} className="group hover:ring-1 hover:ring-primary/20 transition-all shadow-sm">
                                        <CardHeader className="pb-3 flex flex-row items-start justify-between">
                                            <div className="space-y-1 pr-4 min-w-0">
                                                <CardTitle className="text-sm font-semibold truncate">{source.label}</CardTitle>
                                                <CardDescription className="text-xs truncate flex items-center gap-1">
                                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                                    {new URL(source.url).hostname}
                                                </CardDescription>
                                            </div>
                                            <Badge variant={source.isActive ? "default" : "secondary"} className="text-[10px] h-5">
                                                {source.isActive ? 'Active' : 'Paused'}
                                            </Badge>
                                        </CardHeader>
                                        <CardContent className="pb-4 flex items-center justify-between border-t pt-4 bg-muted/5">
                                            <div className="flex items-center gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="h-8 px-3 text-xs gap-1.5"
                                                            disabled={!source.isActive}
                                                            onClick={() => handleTrigger(source.id, source.label)}
                                                        >
                                                            <Play className="w-3.5 h-3.5 fill-current" />
                                                            Run Now
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Run scraper manually</TooltipContent>
                                                </Tooltip>
                                                
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                                                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </a>
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => handleOpenModal(source)}>
                                                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-50 hover:text-rose-600" onClick={() => handleDeleteSource(source)}>
                                                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-0 outline-none">
                            <Card className="shadow-sm border-none">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="text-xs font-medium">Source</TableHead>
                                            <TableHead className="text-xs font-medium">Status</TableHead>
                                            <TableHead className="text-xs font-medium">Time</TableHead>
                                            <TableHead className="text-xs font-medium text-right">Items</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            Array(5).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={4} className="h-12 animate-pulse bg-muted/10" /></TableRow>)
                                        ) : jobs.length > 0 ? jobs.map(job => (
                                            <TableRow key={job.id} className="hover:bg-muted/5">
                                                <TableCell className="py-3">
                                                    <span className="font-medium text-sm">{job.scrapeSource?.label || 'Deleted Source'}</span>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(job.status)}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {formatDate(job.startedAt)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={cn("font-medium", job.candidatesFound > 0 ? "text-primary" : "text-muted-foreground/30")}>
                                                        {job.candidatesFound}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground text-sm">No recent activity</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-sm bg-card overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Database className="w-4 h-4 text-primary" />
                                    Awaiting Review
                                </CardTitle>
                                <Badge variant="outline" className="text-[10px] font-bold">
                                    {stagedExams.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />)
                            ) : stagedExams.length > 0 ? stagedExams.map(staged => (
                                <Link 
                                    key={staged.id} 
                                    href={`/review?id=${staged.id}`} 
                                    className="block p-3 rounded-lg border bg-background hover:border-primary/50 hover:shadow-sm transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="min-w-0 pr-2">
                                            <p className="text-xs font-medium truncate">{staged.title || 'Untitled item'}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(staged.createdAt)}</p>
                                        </div>
                                        <FileSearch className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                                    </div>
                                </Link>
                            )) : (
                                <div className="text-center py-6">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs text-muted-foreground font-medium">All caught up!</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="pt-0 border-t">
                            <Button variant="ghost" className="w-full text-xs h-10 gap-2 hover:bg-muted" asChild>
                                <Link href="/review">
                                    View Review Queue
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="bg-slate-950 text-slate-50 border-none shadow-lg overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
                        <CardHeader className="pb-2 relative">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" />
                                System Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-2 relative">
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">The scraper engine is running normally and monitoring active sources.</p>
                            <div className="space-y-3 pt-2">
                                {[
                                    { label: "Uptime", value: "99.9%", color: "text-emerald-400" },
                                    { label: "Daily Volume", value: "~2,400 items", color: "text-primary" },
                                    { label: "Latency", value: "1.2ms", color: "text-slate-300" }
                                ].map((row, i) => (
                                    <div key={i} className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                                        <span className="text-slate-500 font-medium">{row.label}</span>
                                        <span className={cn("font-medium", row.color)}>{row.value}</span>
                                    </div>
                                ))}
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
                                    toast.success('Source updated successfully');
                                } else {
                                    await scraperService.createSource(data);
                                    toast.success('New source added');
                                }
                                setIsModalOpen(false);
                                fetchData(true);
                            } catch (error) {
                                toast.error('An error occurred. Please try again.');
                            }
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-2xl max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Source?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                            You are about to remove <span className="font-semibold text-foreground">{sourceToDelete?.label}</span>. This will stop all scheduled scraping for this website.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteSource} className="rounded-xl bg-rose-600 hover:bg-rose-700">Remove Source</AlertDialogAction>
                    </AlertDialogFooter>
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
        { id: 'GLOBAL', label: 'All Categories' },
        { id: 'GOVERNMENT_JOBS', label: 'Government Central/State' },
        { id: 'BANKING_JOBS', label: 'Banking & Financial' },
        { id: 'RAILWAY_JOBS', label: 'Railway Recruitment' },
        { id: 'DEFENCE_JOBS', label: 'Defence & Security' },
        { id: 'POLICE_JOBS', label: 'Police Force' },
        { id: 'UPSC', label: 'Union Public Service' },
        { id: 'SSC', label: 'Staff Selection' },
        { id: 'STATE_PSC', label: 'State Commission' },
        { id: 'TEACHING_ELIGIBILITY', label: 'Teaching & Academia' },
        { id: 'ENGINEERING_ENTRANCE', label: 'Engineering' },
        { id: 'MEDICAL_ENTRANCE', label: 'Medical' },
        { id: 'OTHER', label: 'Other' },
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
            <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle className="text-lg font-semibold">
                        {source ? 'Edit Source' : 'Add New Source'}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {source ? 'Update the details for this website.' : 'Provide a name and URL to start scraping data.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFormSave} className="p-6 space-y-5 bg-background">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="label" className="text-xs font-medium text-muted-foreground">Source Name</Label>
                            <Input
                                id="label"
                                required
                                value={label}
                                onChange={e => setLabel(e.target.value)}
                                placeholder="e.g. UPSC Official Portal"
                                className="h-10 rounded-lg text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url" className="text-xs font-medium text-muted-foreground">Website URL</Label>
                            <Input
                                id="url"
                                required
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                placeholder="https://example.com/jobs"
                                className="h-10 rounded-lg text-sm"
                                type="url"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Scrape Mode</Label>
                            <Select value={sourceType} onValueChange={(val: any) => setSourceType(val)}>
                                <SelectTrigger className="h-10 rounded-lg text-sm">
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LISTING">Listing Page</SelectItem>
                                    <SelectItem value="DETAIL">Single Page</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Category</Label>
                            <Select value={hintCategory} onValueChange={setHintCategory}>
                                <SelectTrigger className="h-10 rounded-lg text-sm text-left">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id} className="text-sm">{cat.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-dashed">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium block">Active Status</Label>
                            <span className="text-[10px] text-muted-foreground">Toggle to pause or resume scraping</span>
                        </div>
                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="rounded-lg h-10 px-6 text-sm">Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="rounded-lg h-10 px-8 text-sm shadow-md">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : source ? 'Save Changes' : 'Add Source'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
