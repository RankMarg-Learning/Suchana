'use client';

import { useState, useEffect } from 'react';
import { 
    Database, 
    Play, 
    RefreshCcw, 
    Search, 
    Filter, 
    Activity, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    ChevronRight,
    ArrowUpRight,
    MessageSquare,
    Link as LinkIcon,
    PauseCircle
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { scraperService, ScrapeJob, ScrapeSource, ReviewStats } from '@/lib/api';

export default function ScraperPage() {
    const [jobs, setJobs] = useState<ScrapeJob[]>([]);
    const [sources, setSources] = useState<ScrapeSource[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, sourcesRes, statsRes] = await Promise.all([
                    scraperService.listJobs(),
                    scraperService.listSources(),
                    scraperService.getStats()
                ]);
                setJobs(jobsRes.data || []);
                setSources(sourcesRes.data || []);
                setStats(statsRes.data);
            } catch (error) {
                console.error('Failed to fetch scraper data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'COMPLETED': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'RUNNING': return <Activity className="w-5 h-5 text-primary animate-spin" />;
            case 'FAILED': return <AlertCircle className="w-5 h-5 text-rose-500" />;
            default: return <Clock className="w-5 h-5 text-amber-500" />;
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-outfit">Scraper Dashboard</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Monitor automated exam discovery and data extraction.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 font-bold text-sm">
                        <Play className="w-5 h-5" />
                        <span>Run All Scrapers</span>
                    </button>
                    <button className="p-3 rounded-xl border border-border bg-card hover:bg-muted transition-all duration-300">
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="premium-card rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <Database className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Jobs</span>
                    </div>
                    <h3 className="text-3xl font-bold font-outfit">{stats?.totalJobs || '0'}</h3>
                    <div className="absolute -bottom-6 -right-6 text-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                         <Database className="w-32 h-32" />
                    </div>
                </div>
                <div className="premium-card rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Pending Review</span>
                    </div>
                    <h3 className="text-3xl font-bold font-outfit">{stats?.reviewQueue.pending || '0'}</h3>
                    <div className="absolute -bottom-6 -right-6 text-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                         <Clock className="w-32 h-32" />
                    </div>
                </div>
                <div className="premium-card rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Success Rate</span>
                    </div>
                    <h3 className="text-3xl font-bold font-outfit">94.2%</h3>
                    <div className="absolute -bottom-6 -right-6 text-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                         <CheckCircle2 className="w-32 h-32" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Sources List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold font-outfit">Scrape Sources</h2>
                        <button className="text-sm font-bold text-primary hover:underline">Add Source</button>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-3xl animate-pulse" />)
                        ) : sources.map(source => (
                            <div key={source.id} className="premium-card rounded-3xl p-6 hover:border-primary/50 transition-all duration-500 group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                                            source.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                        )}>
                                            {source.label[0]}
                                        </div>
                                        <div className="flex flex-col gap-1 overflow-hidden">
                                            <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{source.label}</h4>
                                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
                                                <LinkIcon className="w-3 h-3" />
                                                <span className="truncate">{source.url}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest",
                                            source.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                        )}>
                                            {source.isActive ? 'Active' : 'Paused'}
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary hover:text-white transition-all">
                                                <Play className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-amber-500 hover:text-white transition-all">
                                                <RefreshCcw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Jobs History */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold font-outfit">Recent Job History</h2>
                    <div className="premium-card rounded-3xl overflow-hidden divide-y divide-border/50">
                        {loading ? (
                             [1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-muted/30 animate-pulse" />)
                        ) : jobs.length > 0 ? (
                            jobs.map(job => (
                                <div key={job.id} className="p-5 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {getStatusIcon(job.status)}
                                            {job.status === 'RUNNING' && <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold group-hover:text-primary transition-colors">{job.scrapeSource?.label || 'Source'}</span>
                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground font-medium">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{formatDate(job.startedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-end shrink-0">
                                            <span className="font-bold text-sm">{job.candidatesFound} candidates</span>
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Found</span>
                                        </div>
                                        <button className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center flex flex-col items-center gap-4">
                                <Clock className="w-12 h-12 text-muted-foreground opacity-20" />
                                <p className="text-muted-foreground">No recent jobs found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
