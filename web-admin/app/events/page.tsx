'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Smartphone,
    Search,
    Calendar,
    Clock,
    ExternalLink,
    Bell,
    RefreshCw,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { lifecycleService, LifecycleEvent } from '@/lib/api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function EventsTimelinePage() {
    const router = useRouter();
    const [search, setSearch] = useState('');

    const { data: response, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['all-lifecycle-events'],
        queryFn: () => lifecycleService.getAllEvents(),
    });

    const events = response?.data || [];

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        (event as any).exam?.title?.toLowerCase().includes(search.toLowerCase()) ||
        (event as any).exam?.shortTitle?.toLowerCase().includes(search.toLowerCase())
    );

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'REGISTRATION': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'ADMIT_CARD': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'EXAM_DATE': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'RESULT': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'ANSWER_KEY': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6 max-w-7xl">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Timeline & Events</h1>
                    <p className="text-muted-foreground mt-1">Cross-platform view of all upcoming exam milestones and notifications.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading || isRefetching}>
                        <RefreshCw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
                    </Button>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Smartphone className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Total Upcoming</CardDescription>
                        <CardTitle className="text-2xl">{events.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Notified</CardDescription>
                        <CardTitle className="text-2xl text-emerald-600">{events.filter(e => e.notificationSent).length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="p-4 pb-2">
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Pending Sync</CardDescription>
                        <CardTitle className="text-2xl text-amber-600">{events.filter(e => !e.notificationSent).length}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Upcoming Milestones</CardTitle>
                    <div className="pt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by event or exam title..."
                                className="pl-9 bg-slate-50/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead className="w-[250px]">Exam</TableHead>
                                <TableHead>Event Milestone</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead>Stage</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredEvents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-10" />
                                        <h3 className="mt-4 text-sm font-semibold text-muted-foreground uppercase tracking-widest">No matching events</h3>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEvents.map((event: any) => (
                                    <TableRow key={event.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-bold text-slate-900 tracking-tight leading-none truncate max-w-[220px]">
                                                    {event.exam?.title}
                                                </div>
                                                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                                    {event.exam?.shortTitle || 'EXAM'}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-700">{event.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                                    <Calendar className="h-3 w-3 text-indigo-500" />
                                                    {event.startsAt ? format(new Date(event.startsAt), 'MMM dd, yyyy') : 'TBD'}
                                                </div>
                                                {event.startsAt && (
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(event.startsAt), 'hh:mm a')}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn("text-[9px] font-black tracking-widest uppercase px-2 py-0.5", getStageColor(event.stage))}>
                                                {event.stage.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {event.notificationSent ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                                                    <Bell className="h-3 w-3" />
                                                    Notified
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Queued
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                                                onClick={() => router.push(`/exam/${event.exam?.slug}/edit`)}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
