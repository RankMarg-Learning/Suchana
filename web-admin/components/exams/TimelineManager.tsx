'use client';

import React, { useState, useEffect } from 'react';
import {
    Clock,
    Plus,
    Trash2,
    Save,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    GripVertical,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LifecycleEvent, lifecycleService, revalidationService } from '@/lib/api';
import { LifecycleStage } from '@/constants/enums';
import { toast } from 'sonner';
import { DatePicker } from '../ui/DatePicker';
import { Reorder } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import MarkdownRenderer from '../MarkdownRenderer';

interface TimelineManagerProps {
    examId: string;
    initialEvents?: LifecycleEvent[];
    slug?: string;
}

export default function TimelineManager({ examId, initialEvents, slug }: TimelineManagerProps) {
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
    const [hasOrderChanged, setHasOrderChanged] = useState(false);

    useEffect(() => {
        if (initialEvents && events.length === 0) {
            const sorted = [...initialEvents].sort((a, b) => (a.stageOrder ?? 999) - (b.stageOrder ?? 999));
            setEvents(sorted);
            setLoading(false);
        } else if (examId && events.length === 0) {
            fetchEvents();
        }
    }, [examId, initialEvents]);

    const notifyFrontend = async () => {
        if (!slug) return;
        try {
            await revalidationService.triggerRevalidation(['/', '/all-exams', `/exam/${slug}`]);
        } catch (error) {
            // fail silently, not critical for user flow
        }
    };

    const fetchEvents = async () => {
        if (!examId) return;

        try {
            setLoading(true);
            const response = await lifecycleService.getEventsByExamId(examId);

            if (response.success && Array.isArray(response.data)) {
                const sorted = [...response.data].sort((a, b) => (a.stageOrder ?? 999) - (b.stageOrder ?? 999));
                setEvents(sorted);
            } else if (Array.isArray(response)) {
                const sorted = [...(response as any)].sort((a: any, b: any) => (a.stageOrder ?? 999) - (b.stageOrder ?? 999));
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
            await lifecycleService.addEvent(examId, {
                ...newEvent,
                stageOrder: (events.length + 1) * 10
            });
            toast.success('Event added to timeline');
            setIsAdding(false);
            setNewEvent({ stage: LifecycleStage.NOTIFICATION, title: '', isTBD: false });
            fetchEvents();
            notifyFrontend();
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
            notifyFrontend();
        } catch (error) {
            toast.error('Failed to delete event');
        }
    };

    const handleUpdateEvent = async (eventId: string, data: any) => {
        try {
            const { id, examId: _, createdAt, updatedAt, ...sanitized } = data;
            await lifecycleService.updateEvent(examId, eventId, sanitized);
            toast.success('Event updated');
            fetchEvents();
            notifyFrontend();
        } catch (error) {
            toast.error('Failed to update event');
        }
    };

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
            notifyFrontend();
        } catch (error) {
            console.error('Failed to sync sequence:', error);
            toast.error('Sequence Sync Failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-3 text-primary" />
            <span className="text-sm font-medium">Loading timeline...</span>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Lifecycle Events</h3>
                <div className="flex items-center gap-2">
                    {hasOrderChanged && (
                        <Button type="button" variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" onClick={syncSequence}>
                            <Save className="w-4 h-4 mr-2" /> Save Sequence
                        </Button>
                    )}
                    <Button type="button" variant={isAdding ? "outline" : "default"} onClick={() => setIsAdding(!isAdding)}>
                        {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Event</>}
                    </Button>
                </div>
            </div>

            {isAdding && (
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Event Title</Label>
                                <Input
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="e.g. Admit Card Release"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Lifecycle Stage</Label>
                                <Select
                                    value={newEvent.stage}
                                    onValueChange={(val) => setNewEvent({ ...newEvent, stage: val as LifecycleStage })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select stage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(LifecycleStage).map(s => (
                                            <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Trigger URL (Action Link)</Label>
                            <Input
                                value={newEvent.actionUrl || ''}
                                onChange={(e) => setNewEvent({ ...newEvent, actionUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        {newEvent.description && (
                            <div className="space-y-2">
                                <Label>Description <span className="text-muted-foreground font-normal">(Markdown supported)</span></Label>
                                <Textarea
                                    value={newEvent.description || ''}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Details about this stage..."
                                    className="min-h-[80px] resize-y"
                                />
                                <div className="p-2 border rounded bg-muted/5 text-[11px] overflow-y-auto custom-scrollbar max-h-[120px] min-h-[100px]">
                                    <MarkdownRenderer content={newEvent.description} variant="fact" />
                                </div>
                            </div>
                        )}
                        {!newEvent.description && (
                            <div className="space-y-2">
                                <Label>Description <span className="text-muted-foreground font-normal">(Markdown supported)</span></Label>
                                <Textarea
                                    value={newEvent.description || ''}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Details about this stage..."
                                    className="min-h-[80px] resize-y"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <DatePicker
                                    label="Start Date"
                                    date={newEvent.startsAt ?? undefined}
                                    onChange={(date) => setNewEvent({ ...newEvent, startsAt: date?.toISOString() || null })}
                                    disabled={newEvent.isTBD}
                                />
                            </div>
                            <div className="space-y-2">
                                <DatePicker
                                    label="End Date (Optional)"
                                    date={newEvent.endsAt ?? undefined}
                                    onChange={(date) => setNewEvent({ ...newEvent, endsAt: date?.toISOString() || null })}
                                    disabled={newEvent.isTBD}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={newEvent.isTBD}
                                    onCheckedChange={(checked) => setNewEvent({ ...newEvent, isTBD: checked })}
                                />
                                <Label className="cursor-pointer">Date is TBD (To be announced)</Label>
                            </div>
                            <Button type="button" onClick={handleAddEvent}>
                                Save Event
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="relative">
                {(!events || !Array.isArray(events) || events.length === 0) ? (
                    <div className="border border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No lifecycle events recorded for this exam</p>
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

    return (
        <Card className={cn(
            "transition-all group/item overflow-hidden",
            isEditing ? "border-primary/50 ring-1 ring-primary/20" : "hover:border-primary/20",
            status === 'PAST' && "opacity-75 grayscale-[0.2]"
        )}>
            <div className="flex items-center p-4 gap-4 bg-card">
                <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                    <GripVertical className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{event.title}</h4>
                        <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                            {event.stage.replace(/_/g, ' ')}
                        </Badge>
                        {status === 'ACTIVE' && (
                            <Badge className="text-[10px] bg-emerald-500 hover:bg-emerald-600 uppercase">Active</Badge>
                        )}
                        {status === 'TBD' && (
                            <Badge variant="outline" className="text-[10px] text-orange-500 border-orange-200 uppercase">TBD</Badge>
                        )}
                    </div>
                    {event.description && (
                        <div className="mb-2 line-clamp-1 max-w-[400px]">
                            <MarkdownRenderer content={event.description} variant="fact" />
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {event.isTBD ? (
                            <span>To be announced</span>
                        ) : (
                            <span className="flex items-center gap-1">
                                {formatShortDate(event.startsAt)}
                                {event.endsAt && (
                                    <>
                                        <span>—</span>
                                        {formatShortDate(event.endsAt)}
                                    </>
                                )}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/item:opacity-100 transition-opacity"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {isEditing && (
                <div className="p-4 border-t bg-muted/20 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Event Title</Label>
                            <Input
                                value={editData.title}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Lifecycle Stage</Label>
                            <Select
                                value={editData.stage}
                                onValueChange={(val) => setEditData({ ...editData, stage: val as LifecycleStage })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(LifecycleStage).map(s => (
                                        <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Trigger URL (Action Link)</Label>
                        <Input
                            value={editData.actionUrl || ''}
                            onChange={(e) => setEditData({ ...editData, actionUrl: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description <span className="text-muted-foreground font-normal">(Markdown supported)</span></Label>
                        <Textarea
                            value={editData.description || ''}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            placeholder="Details about this stage..."
                            className="min-h-[80px] resize-y"
                        />
                        {editData.description && (
                            <div className="p-2 border rounded bg-muted/5 text-[11px] overflow-y-auto custom-scrollbar max-h-[120px] min-h-[100px]">
                                <MarkdownRenderer content={editData.description} variant="fact" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <DatePicker
                                label="Start Date"
                                date={editData.startsAt ?? undefined}
                                onChange={(date) => setEditData({ ...editData, startsAt: date?.toISOString() || null })}
                                disabled={editData.isTBD}
                            />
                        </div>
                        <div className="space-y-2">
                            <DatePicker
                                label="End Date"
                                date={editData.endsAt ?? undefined}
                                onChange={(date) => setEditData({ ...editData, endsAt: date?.toISOString() || null })}
                                disabled={editData.isTBD}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                            <Switch
                                checked={editData.isTBD}
                                onCheckedChange={(checked) => setEditData({ ...editData, isTBD: checked })}
                            />
                            <Label className="cursor-pointer">TBD (Pending Schedule)</Label>
                        </div>

                        <Button
                            type="button"
                            onClick={() => onUpdate(editData)}
                        >
                            Update Event
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
