'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Tag as TagIcon,
    Plus,
    Pencil,
    Trash2,
    Search,
    Check,
    X,
    RefreshCw,
    Hash,
    FileText,
    Palette,
    AlertCircle,
} from 'lucide-react';
import { Tag, tagService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ─── Preset colour palette ──────────────────────────────────────────────────
const PRESET_COLORS = [
    '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
    '#64748b', '#334155', '#1e293b',
];

// ─── Helper ──────────────────────────────────────────────────────────────────
function toSlug(name: string) {
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-');
}

// ─── Tag card ────────────────────────────────────────────────────────────────
function TagCard({ tag, onEdit, onDelete }: { tag: Tag; onEdit: (t: Tag) => void; onDelete: (t: Tag) => void }) {
    return (
        <div className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-px">
            {/* colour dot */}
            <span
                className="flex-shrink-0 w-3 h-3 rounded-full ring-2 ring-white shadow"
                style={{ background: tag.color }}
            />
            {/* name & meta */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{tag.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">#{tag.slug}</span>
                </div>
                {tag.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{tag.description}</p>
                )}
            </div>

            {/* actions – visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(tag)}>
                    <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(tag)}>
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
}

// ─── Tag form (create / edit) ────────────────────────────────────────────────
interface TagFormProps {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
    editing: Tag | null;
}

function TagFormDialog({ open, onClose, onSaved, editing }: TagFormProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#6366f1');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setName(editing?.name ?? '');
            setColor(editing?.color ?? '#6366f1');
            setDescription(editing?.description ?? '');
            setError('');
            setTimeout(() => nameRef.current?.focus(), 80);
        }
    }, [open, editing]);

    const slugPreview = name ? toSlug(name) : '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Name is required'); return; }
        setSaving(true);
        setError('');
        try {
            if (editing) {
                await tagService.update(editing.id, { name: name.trim(), color, description: description || undefined });
            } else {
                await tagService.create({ name: name.trim(), color, description: description || undefined });
            }
            onSaved();
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.error?.message ?? 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: color }} />
                        {editing ? 'Edit Tag' : 'Create New Tag'}
                    </DialogTitle>
                    <DialogDescription>
                        Tags help organise articles for filtering and discovery.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="tag-name">Name <span className="text-destructive">*</span></Label>
                        <Input
                            id="tag-name"
                            ref={nameRef}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. UPSC, Science, Maths"
                        />
                        {slugPreview && (
                            <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                                <Hash className="w-3 h-3" /> {slugPreview}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="tag-desc">Description</Label>
                        <Textarea
                            id="tag-desc"
                            className="h-20 resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional short description"
                        />
                    </div>

                    {/* Colour picker */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> Colour</Label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={cn(
                                        'w-6 h-6 rounded-full border-2 transition-transform hover:scale-110',
                                        color === c ? 'border-foreground scale-110' : 'border-transparent'
                                    )}
                                    style={{ background: c }}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>
                        {/* Custom hex */}
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border border-input"
                            />
                            <Input
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="flex-1 font-mono text-sm h-8"
                                maxLength={7}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                        <Button type="submit" disabled={saving || !name.trim()}>
                            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                            {editing ? 'Save Changes' : 'Create Tag'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Confirm delete dialog ────────────────────────────────────────────────────
function DeleteDialog({ tag, open, onClose, onDeleted }: { tag: Tag | null; open: boolean; onClose: () => void; onDeleted: () => void }) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!tag) return;
        setDeleting(true);
        try {
            await tagService.delete(tag.id);
            onDeleted();
            onClose();
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Delete Tag</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>&ldquo;{tag?.name}&rdquo;</strong>? It will be removed from all{' '}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={deleting}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                        {deleting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Tag | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await tagService.getAll();
            if (res.success) setTags(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = tags.filter((t) =>
        !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase())
    );

    const handleEdit = (tag: Tag) => { setEditing(tag); setFormOpen(true); };
    const handleDelete = (tag: Tag) => setDeleteTarget(tag);
    const handleCreate = () => { setEditing(null); setFormOpen(true); };


    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <TagIcon className="w-6 h-6 text-primary" />
                        Tag Manager
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Create and manage content labels used across articles
                    </p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Tag
                </Button>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Card className="shadow-none">
                    <CardContent className="p-4 flex items-center gap-3">
                        <TagIcon className="w-5 h-5 text-indigo-500" />
                        <div>
                            <p className="text-xs text-muted-foreground">Total Tags</p>
                            <p className="text-2xl font-bold">{tags.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-none">
                    <CardContent className="p-4 flex items-center gap-3">
                        <FileText className="w-5 h-5 text-emerald-500" />
                        <div>
                            <p className="text-xs text-muted-foreground">Tagged Articles</p>
                            <p className="text-2xl font-bold">0</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-none sm:block hidden">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Palette className="w-5 h-5 text-amber-500" />
                        <div>
                            <p className="text-xs text-muted-foreground">Unique Colours</p>
                            <p className="text-2xl font-bold">{new Set(tags.map((t) => t.color)).size}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search tags…"
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setSearch('')}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <Separator />

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    Loading tags…
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                    <TagIcon className="w-10 h-10 opacity-30" />
                    <p className="text-sm">{search ? 'No tags match your search.' : 'No tags yet. Create your first tag!'}</p>
                    {!search && (
                        <Button variant="outline" size="sm" onClick={handleCreate}>
                            <Plus className="w-4 h-4 mr-1.5" /> Create Tag
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map((tag) => (
                        <TagCard key={tag.id} tag={tag} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            {/* Modals */}
            <TagFormDialog
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSaved={load}
                editing={editing}
            />
            <DeleteDialog
                tag={deleteTarget}
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onDeleted={load}
            />
        </div>
    );
}
