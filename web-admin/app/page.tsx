'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Layers,
    Globe,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Zap,
    Trash2,
    Loader2,
    RefreshCw,
    Activity,
    ShieldCheck,
    Cpu,
    Database,
    Fingerprint,
    Search
} from 'lucide-react';
import { examService, scraperService } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
    const queryClient = useQueryClient();

    // Stats Query
    const { data: statsResponse, isLoading: statsLoading, isRefetching } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const [examRes, scraperRes] = await Promise.all([
                examService.getAllExams({ limit: 1 }),
                scraperService.getStats(),
            ]);
            return {
                exams: examRes,
                scraper: scraperRes.data
            };
        },
        refetchInterval: 30000,
    });

    // Clear Cache Mutation
    const clearCacheMutation = useMutation({
        mutationFn: () => scraperService.clearCache(),
        onSuccess: () => {
            toast.success('Global Redis cache has been flushed');
            queryClient.invalidateQueries();
        },
        onError: () => toast.error('Failed to clear cache')
    });

    const scraperStats = statsResponse?.scraper;
    const examCount = statsResponse?.exams?.meta?.total || 0;
    const recentJobs = scraperStats?.recentJobs || [];

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        toast.info('Refreshing intelligence data...');
    };

    return (
        <div className="container mx-auto py-8 space-y-8 max-w-7xl">
            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Intelligence Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor system health, pipeline activity, and exam lifecycle events.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefetching}
                    >
                        <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/exams/create">New Exam</Link>
                    </Button>
                </div>
            </div>

            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Live Exams</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{examCount}</div>}
                        <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">In Review Queue</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{scraperStats?.reviewQueue.pending || 0}</div>}
                        <p className="text-xs text-muted-foreground mt-1">Across all scrape sources</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Approved</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-emerald-600">{scraperStats?.reviewQueue.approved || 0}</div>}
                        <p className="text-xs text-muted-foreground mt-1">Ready for publishing</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Need Attention</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-amber-600">{scraperStats?.reviewQueue.needsCorrection || 0}</div>}
                        <p className="text-xs text-muted-foreground mt-1">Staged exams with issues</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pipeline Activity */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Pipeline Activity</CardTitle>
                            <CardDescription>Recent jobs from the Suchana scraper network.</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/scraper">History <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {statsLoading ? (
                                Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                            ) : recentJobs.length > 0 ? (
                                recentJobs.slice(0, 5).map((job: any) => (
                                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                job.status === 'COMPLETED' ? "bg-emerald-500" :
                                                    job.status === 'FAILED' ? "bg-rose-500" : "bg-amber-500 animate-pulse"
                                            )} />
                                            <div>
                                                <p className="text-sm font-semibold uppercase">{job.scrapeSource?.label || 'Manual Sync'}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {job.candidatesFound} Assets found • {new Date(job.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={job.status === 'COMPLETED' ? 'outline' : 'secondary'} className={cn(
                                            "uppercase text-[10px] font-bold tracking-widest",
                                            job.status === 'COMPLETED' && "border-emerald-200 text-emerald-700 bg-emerald-50"
                                        )}>
                                            {job.status}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-muted-foreground italic text-sm">No recent activity detected.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* System Health */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                System Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Extractors</span>
                                <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100 uppercase text-[9px]">Stable</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Redis Cache</span>
                                <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100 uppercase text-[9px]">Online</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">OCR Engine</span>
                                <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100 uppercase text-[9px]">Active</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Maintenance Tools */}
                    <Card className="border-rose-100 shadow-sm shadow-rose-500/5">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Zap className="h-4 w-4 text-rose-500" />
                                Maintenance Tools
                            </CardTitle>
                            <CardDescription className="text-[11px]">Use these tools for cluster maintenance.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
                                        disabled={clearCacheMutation.isPending}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Flush Global Cache
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action will clear all cached data from Redis. While the database is untouched, it may cause a temporary performance drop as the cluster rebuilds the cache.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => clearCacheMutation.mutate()}
                                            className="bg-rose-600 hover:bg-rose-700"
                                        >
                                            Clear Cache
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

const ArrowRight = ({ className, ...props }: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);
