'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorService, Author } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Edit, Trash2, Plus, User, BadgeCheck, XCircle, Loader2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function AuthorPage() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        designation: '',
        bio: '',
        image: '',
        isActive: true
    });

    const { data: authors, isLoading } = useQuery({
        queryKey: ['authors'],
        queryFn: () => authorService.getAll()
    });

    const createMutation = useMutation({
        mutationFn: authorService.create,
        onSuccess: () => {
            toast.success('Author created');
            queryClient.invalidateQueries({ queryKey: ['authors'] });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => toast.error(error.message || 'Failed to create author')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => authorService.update(id, data),
        onSuccess: () => {
            toast.success('Author updated');
            queryClient.invalidateQueries({ queryKey: ['authors'] });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => toast.error(error.message || 'Failed to update author')
    });

    const deleteMutation = useMutation({
        mutationFn: authorService.delete,
        onSuccess: () => {
            toast.success('Author deleted');
            queryClient.invalidateQueries({ queryKey: ['authors'] });
        },
        onError: (error: any) => toast.error(error.message || 'Failed to delete author')
    });

    const resetForm = () => {
        setFormData({
            name: '',
            slug: '',
            designation: '',
            bio: '',
            image: '',
            isActive: true
        });
        setEditingAuthor(null);
    };

    const handleEdit = (author: Author) => {
        setEditingAuthor(author);
        setFormData({
            name: author.name,
            slug: author.slug,
            designation: author.designation || '',
            bio: author.bio || '',
            image: author.image || '',
            isActive: author.isActive
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAuthor) {
            updateMutation.mutate({ id: editingAuthor.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleNameChange = (name: string) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        setFormData({ ...formData, name, slug });
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Authors</h1>
                    <p className="text-muted-foreground">Manage content creators and their profiles</p>
                </div>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Author
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Author List</CardTitle>
                    <CardDescription>All registered authors in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created At</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {authors?.data?.map((author) => (
                                    <TableRow key={author.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={author.image || ''} />
                                                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold">{author.name}</div>
                                                    <div className="text-xs text-muted-foreground">/{author.slug}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{author.designation || '-'}</TableCell>
                                        <TableCell>
                                            {author.isActive ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium">
                                                    <BadgeCheck className="h-3 w-3" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-xs font-medium">
                                                    <XCircle className="h-3 w-3" /> Inactive
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(author.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(author)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this author?')) {
                                                            deleteMutation.mutate(author.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {authors?.data?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No authors found. Click "Add Author" to create one.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingAuthor ? 'Edit Author' : 'Create Author'}</DialogTitle>
                            <DialogDescription>
                                Fill in the details for the author profile.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="john-doe"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="designation">Designation</Label>
                                <Input
                                    id="designation"
                                    value={formData.designation}
                                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                    placeholder="e.g. Content Strategist"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="bio">Biography</Label>
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Short bio about the author..."
                                    className="h-24"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="image">Profile Image URL</Label>
                                <Input
                                    id="image"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2 pt-2">
                                <Label htmlFor="is-active">Active Profile</Label>
                                <Switch
                                    id="is-active"
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {createMutation.isPending || updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {editingAuthor ? 'Update Author' : 'Create Author'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
