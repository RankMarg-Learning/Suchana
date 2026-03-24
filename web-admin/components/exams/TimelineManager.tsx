'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    Plus,
    Trash2,
    Save,
    X,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    AlertCircle,
    GripVertical,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiResponse, Exam, LifecycleEvent, examService, lifecycleService } from '@/lib/api';
import { ExamCategory, ExamLevel, ExamStatus, LifecycleStage } from '@/constants/enums';
import { toast } from 'sonner';
import { DatePicker } from '../ui/DatePicker';
import { Reorder } from 'framer-motion';

interface TimelineManagerProps {
    examId: string;
    initialEvents?: LifecycleEvent[];
}

export default function TimelineManager({ examId, initialEvents }: TimelineManagerProps) {
    console.log("initialize", initialEvents)
    const [events, setEvents] = useState<LifecycleEvent[]>(
        [...(initialEvents || [])].sort((a, b) => (a.stageOrder ?? 999) - (b.stageOrder ?? 999))
    );
    const [loading, setLoading] = useState(!initialEvents);
    const [isAdding, setIsAdding] = useState(false);
    const [newEvent, setNewEvent] = useState<Partial<LifecycleEvent>>({
        stage: LifecycleStage.REGISTRATION,
        title: '',
        isTBD: false,
        stageOrder: 10
    });
    const [isDraggable, setIsDraggable] = useState(false);
    const [hasOrderChanged, setHasOrderChanged] = useState(false);

    useEffect(() => {
        // Only sync if we don't have events yet. 
        // Once TimelineManager has events, it manages them independently to avoid resets from parent re-renders.
        if (initialEvents && events.length === 0) {
            const sorted = [...initialEvents].sort((a, b) => (a.stageOrder ?? 999) - (b.stageOrder ?? 999));
            setEvents(sorted);
            setLoading(false);
        } else if (examId && events.length === 0) {
            fetchEvents();
        }
    }, [examId, initialEvents]);

    const fetchEvents = async () => {
        if (!examId) return;

        try {
            setLoading(true);
            const response = await lifecycleService.getEventsByExamId(examId);

            if (response.success && Array.isArray(response.data)) {
                const sorted = [...response.data].sort((a, b) => {
                    const orderA = a.stageOrder ?? 999;
                    const orderB = b.stageOrder ?? 999;
                    return orderA - orderB;
                });
                setEvents(sorted);
            } else if (Array.isArray(response)) {
                const sorted = [...(response as any)].sort((a: any, b: any) => {
                    const orderA = a.stageOrder ?? 999;
                    const orderB = b.stageOrder ?? 999;
                    return orderA - orderB;
                });
                setEvents(sorted);
            }
        } catch (error) {
            console.error('Failed to fetch lifecycle events:', error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvent = async () => {
        if (!newEvent.title || !newEvent.stage) {
            toast.error('Title and Stage are required');
            return;
        }

        try {
            const response = await lifecycleService.addEvent(examId, {
                ...newEvent,
                stageOrder: (events.length + 1) * 10
            });
            toast.success('Event added to timeline');
            setIsAdding(false);
            setNewEvent({ stage: LifecycleStage.NOTIFICATION, title: '', isTBD: false });
            // Refresh events
            fetchEvents();
        } catch (error) {
            toast.error('Failed to add event');
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!confirm('Are you sure you want to remove this event?')) return;
        try {
            await lifecycleService.deleteEvent(examId, eventId);
            toast.success('Event removed');
            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        } catch (error) {
            toast.error('Failed to delete event');
        }
    };

    const handleUpdateEvent = async (eventId: string, data: any) => {
        try {
            // Sanitize data for the backend
            const { id, examId: _, createdAt, updatedAt, ...sanitized } = data;
            await lifecycleService.updateEvent(examId, eventId, sanitized);
            toast.success('Event updated');
            // Refresh events
            fetchEvents();
        } catch (error) {
            toast.error('Failed to update event');
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-3 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Hydrating Timeline Vectors...</span>
        </div>
    );

    const handleReorder = (newOrder: LifecycleEvent[]) => {
        const updatedOrder = newOrder.map((event, index) => ({
            ...event,
            stageOrder: (index + 1) * 10
        }));
        setEvents(updatedOrder);
        setHasOrderChanged(true);
    };

    const syncSequence = async () => {
        try {
            setLoading(true);
            for (let i = 0; i < events.length; i++) {
                const event = events[i];
                await lifecycleService.updateEvent(examId, event.id, {
                    stageOrder: (i + 1) * 10
                });
            }
            setHasOrderChanged(false);
            toast.success('Sequence Synchronized');
        } catch (error) {
            console.error('Failed to sync sequence:', error);
            toast.error('Sequence Sync Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">Lifecycle Roadmap</h4>
                </div>
                <div className="flex items-center gap-2">
                    {hasOrderChanged && (
                        <button
                            onClick={syncSequence}
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20 animate-in fade-in zoom-in-95"
                        >
                            <Save className="w-3 h-3 text-emerald-100" /> Save Sequence
                        </button>
                    )}
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-125 transition-all shadow-lg shadow-black/10"
                    >
                        {isAdding ? "Cancel Addition" : <><Plus className="w-3 h-3 text-primary" /> Inject Event</>}
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="bg-orange-50/20 border border-orange-100 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 border-b-4 border-b-orange-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-orange-400 tracking-widest">Event Title</label>
                            <input
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                placeholder="e.g. Admit Card Release"
                                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-orange-500 transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-orange-400 tracking-widest">Lifecycle Stage</label>
                            <select
                                value={newEvent.stage}
                                onChange={(e) => setNewEvent({ ...newEvent, stage: e.target.value as LifecycleStage })}
                                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-orange-500 appearance-none shadow-sm cursor-pointer"
                            >
                                {Object.values(LifecycleStage).map(s => (
                                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <DatePicker
                            label="Start Date"
                            date={newEvent.startsAt ?? undefined}
                            onChange={(date) => setNewEvent({ ...newEvent, startsAt: date?.toISOString() || null })}
                            className="text-orange-400"
                            disabled={newEvent.isTBD}
                        />
                        <DatePicker
                            label="End Date (Optional)"
                            date={newEvent.endsAt ?? undefined}
                            onChange={(date) => setNewEvent({ ...newEvent, endsAt: date?.toISOString() || null })}
                            className="text-orange-400"
                            disabled={newEvent.isTBD}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={newEvent.isTBD}
                                onChange={(e) => setNewEvent({ ...newEvent, isTBD: e.target.checked })}
                                className="hidden"
                            />
                            <div className={cn(
                                "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                                newEvent.isTBD ? "bg-orange-500 border-orange-500" : "bg-white border-gray-100 group-hover:border-orange-200"
                            )}>
                                {newEvent.isTBD && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-gray-600 transition-colors">Date is TBD (To be announced)</span>
                        </label>

                        <button
                            onClick={handleAddEvent}
                            className="px-8 py-2.5 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
                        >
                            Sync Lifecycle
                        </button>
                    </div>
                </div>
            )}

            <div className="relative">
                {(!events || !Array.isArray(events) || events.length === 0) ? (
                    <div className="bg-gray-50/30 border border-dashed border-gray-100 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-gray-200" />
                        </div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] max-w-[200px] leading-relaxed">No lifecycle events recorded for this exam</p>
                    </div>
                ) : (
                    <Reorder.Group axis="y" values={events} onReorder={handleReorder} className="grid gap-3">
                        {events.map((event) => (
                            <Reorder.Item key={event.id} value={event}>
                                <TimelineItem
                                    event={event}
                                    onUpdate={(data) => handleUpdateEvent(event.id, data)}
                                    onDelete={() => handleDeleteEvent(event.id)}
                                />
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                )}
            </div>
        </div>
    );
}

function TimelineItem({ event, onUpdate, onDelete }: { event: LifecycleEvent, onUpdate: (data: any) => void, onDelete: () => void }) {
    console.log(event.stageOrder)
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...event });

    React.useEffect(() => {
        setEditData({ ...event });
    }, [event]);

    const formatShortDate = (dateStr?: string | null) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const now = new Date();
    const start = event.startsAt ? new Date(event.startsAt) : null;
    const end = event.endsAt ? new Date(event.endsAt) : (start ? new Date(start) : null);

    let status: 'UPCOMING' | 'ACTIVE' | 'PAST' | 'TBD' = 'UPCOMING';
    if (event.isTBD) status = 'TBD';
    else if (end && now > end) status = 'PAST';
    else if (start && now >= start && (!end || now <= end)) status = 'ACTIVE';

    const statusConfig = {
        ACTIVE: {
            bg: "bg-emerald-50/30 border-emerald-100/50",
            icon: "bg-emerald-100 text-emerald-600",
            title: "text-emerald-900"
        },
        PAST: {
            bg: "bg-gray-50/50 opacity-60 grayscale border-gray-100",
            icon: "bg-gray-100 text-gray-400",
            title: "text-gray-500"
        },
        UPCOMING: {
            bg: "bg-white border-gray-100",
            icon: "bg-gray-50 text-gray-400",
            title: "text-gray-900"
        },
        TBD: {
            bg: "bg-orange-50/20 border-orange-100/30",
            icon: "bg-orange-100/50 text-orange-500",
            title: "text-orange-900"
        }
    };

    const currentConfig = statusConfig[status];

    return (
        <div className={cn(
            "border rounded-2xl shadow-sm transition-all overflow-hidden group/item",
            currentConfig.bg,
            isEditing ? "ring-2 ring-primary/20 border-primary/20" : "hover:border-primary/10"
        )}>
            <div className="flex items-center p-4 gap-4">
                <div className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-200 hover:text-gray-400 transition-colors">
                    <GripVertical className="w-4 h-4" />
                </div>
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-all", currentConfig.icon)}>
                    <Calendar className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className={cn("font-black text-[12px] uppercase tracking-tight truncate leading-none", currentConfig.title)}>{event.title}</h4>
                        <span className="px-1.5 py-0.5 bg-gray-50/50 text-[7px] font-black uppercase text-gray-400 rounded-md border border-gray-100/50 leading-none">
                            {event.stage.replace(/_/g, ' ')}
                        </span>
                        {status === 'ACTIVE' && (
                            <span className="px-1.5 py-0.5 bg-emerald-500 text-[6px] font-black uppercase text-white rounded-md animate-pulse">Running</span>
                        )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-gray-400">
                        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500">
                            <Clock className="w-3 h-3 text-gray-200" />
                            {event.isTBD ? (
                                <span className="text-orange-400">TBD</span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    {formatShortDate(event.startsAt)}
                                    {event.endsAt && (
                                        <>
                                            <span className="text-gray-200">—</span>
                                            {formatShortDate(event.endsAt)}
                                        </>
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={cn(
                            "p-2 rounded-xl transition-all",
                            isEditing ? "bg-black text-white" : "hover:bg-gray-50 text-gray-300 hover:text-gray-900"
                        )}
                    >
                        {isEditing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl text-gray-300 transition-all opacity-0 group-hover/item:opacity-100"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="px-6 pb-6 pt-2 border-t border-dashed border-gray-50 bg-gray-50/30 space-y-6 animate-in slide-in-from-top-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">Event Title</label>
                            <input
                                value={editData.title}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-primary shadow-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">Lifecycle Stage</label>
                            <select
                                value={editData.stage}
                                onChange={(e) => setEditData({ ...editData, stage: e.target.value as LifecycleStage })}
                                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-primary shadow-sm cursor-pointer appearance-none"
                            >
                                {Object.values(LifecycleStage).map(s => (
                                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">Trigger URL (Action Link)</label>
                        <input
                            value={editData.actionUrl || ''}
                            onChange={(e) => setEditData({ ...editData, actionUrl: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-primary shadow-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <DatePicker
                            label="Start Date"
                            date={editData.startsAt ?? undefined}
                            onChange={(date) => setEditData({ ...editData, startsAt: date?.toISOString() || null })}
                            disabled={editData.isTBD}
                        />
                        <DatePicker
                            label="End Date"
                            date={editData.endsAt ?? undefined}
                            onChange={(date) => setEditData({ ...editData, endsAt: date?.toISOString() || null })}
                            disabled={editData.isTBD}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={editData.isTBD}
                                onChange={(e) => setEditData({ ...editData, isTBD: e.target.checked })}
                                className="hidden"
                            />
                            <div className={cn(
                                "w-4 h-4 rounded-lg border flex items-center justify-center transition-all",
                                editData.isTBD ? "bg-orange-500 border-orange-500" : "bg-white border-gray-200 group-hover:border-primary/50"
                            )}>
                                {editData.isTBD && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className="text-[9px] font-black uppercase text-gray-400 group-hover:text-gray-900 transition-colors">TBD (Pending Schedule)</span>
                        </label>

                        <button
                            onClick={() => onUpdate(editData)}
                            className="flex items-center gap-3 px-6 py-2 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10 hover:brightness-125 active:scale-[0.98] transition-all"
                        >
                            <Save className="w-3.5 h-3.5 text-primary" /> Update Event
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
