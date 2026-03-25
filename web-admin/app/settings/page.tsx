'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Layout, 
    Settings, 
    Plus, 
    Edit2, 
    Trash2, 
    Image as ImageIcon, 
    Link as LinkIcon, 
    Clock, 
    Save, 
    X, 
    AlertTriangle,
    CheckCircle2,
    Search,
    RefreshCw,
    ToggleLeft,
    ToggleRight,
    Key
} from 'lucide-react';
import { configService, HomeBanner, AppConfig } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Shadcn UI
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle,
    DialogTrigger 
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// --- Banners Tab ---
function BannersTab() {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<HomeBanner | null>(null);
    const [deletingBanner, setDeletingBanner] = useState<HomeBanner | null>(null);

    const { data: response, isLoading } = useQuery({
        queryKey: ['banners'],
        queryFn: () => configService.getBanners(),
    });

    const { data: allConfigsResponse } = useQuery({
        queryKey: ['configs-all'],
        queryFn: () => configService.getAllConfigs(), 
    });

    const isGlobalHidden = allConfigsResponse?.data?.find((c: any) => c.key === 'HIDE_HOME_BANNERS')?.value === true;

    const toggleGlobalMutation = useMutation({
        mutationFn: (hide: boolean) => configService.setConfig('HIDE_HOME_BANNERS', hide, 'Master switch for home banner carousel visibility.'),
        onSuccess: () => {
            toast.success('Global banner visibility updated');
            queryClient.invalidateQueries({ queryKey: ['configs-all'] });
        },
        onError: () => toast.error('Failed to update global visibility')
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<HomeBanner>) => configService.createBanner(data),
        onSuccess: () => {
            toast.success('Banner created successfully');
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            setIsCreateModalOpen(false);
        },
        onError: () => toast.error('Failed to create banner')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<HomeBanner> }) => configService.updateBanner(id, data),
        onSuccess: () => {
            toast.success('Banner updated successfully');
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            setEditingBanner(null);
        },
        onError: () => toast.error('Failed to update banner')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => configService.deleteBanner(id),
        onSuccess: () => {
            toast.success('Banner deleted');
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            setDeletingBanner(null);
        },
        onError: () => toast.error('Failed to delete banner')
    });

    const banners = response?.data || [];

    const BannerForm = ({ initialData, onSubmit, onCancel, isSaving }: any) => {
        const [formData, setFormData] = useState(initialData || {
            title: '',
            description: '',
            imageUrl: '',
            actionUrl: '',
            priority: 0,
            isActive: true,
            expiresAt: ''
        });

        return (
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL *</Label>
                    <Input 
                        id="imageUrl" 
                        placeholder="https://images.unsplash.com/..." 
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                        id="title" 
                        placeholder="Banner Headline" 
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea 
                        id="description" 
                        placeholder="Tell users more about this banner" 
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="actionUrl">Action URL</Label>
                    <Input 
                        id="actionUrl" 
                        placeholder="https://..." 
                        value={formData.actionUrl}
                        onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Input 
                            id="priority" 
                            type="number" 
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expiresAt">Expires At</Label>
                        <Input 
                            id="expiresAt" 
                            type="date" 
                            value={formData.expiresAt ? formData.expiresAt.split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                    <Switch 
                        id="isActive" 
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active (Display on App Home)</Label>
                </div>
                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                    <Button onClick={() => onSubmit(formData)} disabled={isSaving || !formData.imageUrl}>
                        {isSaving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Update Banner' : 'Create Banner'}
                    </Button>
                </DialogFooter>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Home Banners</h2>
                    <p className="text-sm text-muted-foreground">Manage the promotional carousel for the mobile app home screen.</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Banner
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>New Home Banner</DialogTitle>
                            <DialogDescription>Add a new promotional image for the application home screen.</DialogDescription>
                        </DialogHeader>
                        <BannerForm 
                            onSubmit={(data: any) => createMutation.mutate(data)} 
                            onCancel={() => setIsCreateModalOpen(false)}
                            isSaving={createMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Global Master Switch */}
            <Card className={cn("border-none shadow-lg transition-all", isGlobalHidden ? "bg-amber-50" : "bg-emerald-50")}>
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-2xl", isGlobalHidden ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600")}>
                             {isGlobalHidden ? <ToggleLeft className="w-6 h-6" /> : <ToggleRight className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 tracking-tight">Entire Banner Section is {isGlobalHidden ? 'DISABLED' : 'VISIBLE'}</h3>
                            <p className="text-xs text-slate-500 font-medium">This is a global override key for the mobile application.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                        <Switch 
                            checked={!isGlobalHidden} 
                            onCheckedChange={(checked) => toggleGlobalMutation.mutate(!checked)}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Master Switch</span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
                ) : banners.length === 0 ? (
                    <Card className="col-span-full py-20 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                        <h3 className="mt-4 text-lg font-semibold">No banners found</h3>
                        <p className="text-muted-foreground">Get started by creating your first promotional banner.</p>
                    </Card>
                ) : (
                    banners.map((banner) => (
                        <Card key={banner.id} className={cn("overflow-hidden flex flex-col group", !banner.isActive && "opacity-75 grayscale-[0.5]")}>
                            <div className="relative h-40 bg-slate-100 overflow-hidden">
                                <img 
                                    src={banner.imageUrl} 
                                    alt={banner.title || "Banner"} 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <Badge variant={banner.isActive ? "default" : "secondary"} className="bg-white/90 backdrop-blur shadow-sm text-slate-900 border-none">
                                        {banner.isActive ? 'Active' : 'Hidden'}
                                    </Badge>
                                    <Badge variant="outline" className="bg-indigo-600 border-none text-white font-black text-[9px] uppercase tracking-widest">
                                        P{banner.priority}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-base truncate">{banner.title || 'Untitled Banner'}</CardTitle>
                                {banner.description && <CardDescription className="line-clamp-2 text-xs">{banner.description}</CardDescription>}
                            </CardHeader>
                            <CardContent className="p-4 pt-0 flex-1 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                                    <LinkIcon className="h-3 w-3" />
                                    <span className="truncate">{banner.actionUrl || 'No Link'}</span>
                                </div>
                                {banner.expiresAt && (
                                    <div className="flex items-center gap-2 text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-auto">
                                        <Clock className="h-3 w-3" />
                                        <span>Expires: {format(new Date(banner.expiresAt), 'PPP')}</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="p-2 pt-0 border-t bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center ml-2">
                                    <Switch 
                                        checked={banner.isActive} 
                                        onCheckedChange={(checked) => updateMutation.mutate({ id: banner.id, data: { isActive: checked } })}
                                        className="scale-75"
                                    />
                                    <span className="text-[9px] uppercase font-black text-slate-400 ml-1">Toggle</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600" onClick={() => setEditingBanner(banner)}>
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => setDeletingBanner(banner)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            <Dialog open={!!editingBanner} onOpenChange={(open) => !open && setEditingBanner(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Banner</DialogTitle>
                        <DialogDescription>Update your banner details and visibility settings.</DialogDescription>
                    </DialogHeader>
                    {editingBanner && (
                        <BannerForm 
                            initialData={editingBanner}
                            onSubmit={(data: any) => updateMutation.mutate({ id: editingBanner.id, data })}
                            onCancel={() => setEditingBanner(null)}
                            isSaving={updateMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!deletingBanner} onOpenChange={(open) => !open && setDeletingBanner(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the "{deletingBanner?.title}" banner. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-rose-600 hover:bg-rose-700"
                            onClick={() => deletingBanner && deleteMutation.mutate(deletingBanner.id)}
                        >
                            Delete Forever
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// --- Config Tab ---
function ConfigTab() {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState<AppConfig | null>(null);
    const [deletingConfig, setDeletingConfig] = useState<AppConfig | null>(null);

    const { data: response, isLoading } = useQuery({
        queryKey: ['configs'],
        queryFn: () => configService.getAllConfigs(),
    });

    const setMutation = useMutation({
        mutationFn: ({ key, value, description }: { key: string, value: any, description?: string }) => 
            configService.setConfig(key, value, description),
        onSuccess: () => {
            toast.success('Configuration saved');
            queryClient.invalidateQueries({ queryKey: ['configs'] });
            setIsCreateModalOpen(false);
            setEditingConfig(null);
        },
        onError: () => toast.error('Failed to save configuration')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => configService.deleteConfig(id),
        onSuccess: () => {
            toast.success('Config key deleted');
            queryClient.invalidateQueries({ queryKey: ['configs'] });
            setDeletingConfig(null);
        },
        onError: () => toast.error('Failed to delete config')
    });

    const configs = response?.data || [];

    const ConfigForm = ({ initialData, onSubmit, onCancel, isSaving }: any) => {
        const [formData, setFormData] = useState({
            key: initialData?.key || '',
            value: initialData ? (typeof initialData.value === 'string' ? initialData.value : JSON.stringify(initialData.value, null, 2)) : '',
            description: initialData?.description || ''
        });

        const handleSubmit = () => {
            let valueToSave = formData.value;
            try {
                // Try to parse as JSON if it looks like JSON
                if (formData.value.startsWith('{') || formData.value.startsWith('[') || formData.value === 'true' || formData.value === 'false') {
                    valueToSave = JSON.parse(formData.value);
                }
            } catch (e) {
                // If parsing fails, just save as string
            }
            onSubmit({ key: formData.key, value: valueToSave, description: formData.description });
        };

        return (
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="key">Config Key *</Label>
                    <Input 
                        id="key" 
                        placeholder="e.g. MAINTENANCE_MODE" 
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                        disabled={!!initialData}
                    />
                    <p className="text-[10px] text-muted-foreground">Keys should be uppercase and descriptive.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="value">Value (JSON or String) *</Label>
                    <Textarea 
                        id="value" 
                        placeholder={'true\n\nor\n\n{"limit": 50}'} 
                        className="font-mono text-sm h-32"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="config-description">Description</Label>
                    <Input 
                        id="config-description" 
                        placeholder="What is this setting for?" 
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>
                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSaving || !formData.key || !formData.value}>
                        {isSaving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Update Config' : 'Create Config'}
                    </Button>
                </DialogFooter>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">App Settings</h2>
                    <p className="text-sm text-muted-foreground">Global configuration constants and feature flags.</p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Configuration
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>New Configuration Key</DialogTitle>
                            <DialogDescription>Define a new global setting for the platform.</DialogDescription>
                        </DialogHeader>
                        <ConfigForm 
                            onSubmit={(data: any) => setMutation.mutate(data)}
                            onCancel={() => setIsCreateModalOpen(false)}
                            isSaving={setMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead className="w-[300px]">Key</TableHead>
                            <TableHead>Current Value</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : configs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-64 text-center">
                                    <Key className="mx-auto h-12 w-12 text-muted-foreground opacity-10" />
                                    <h3 className="mt-4 text-sm font-semibold text-muted-foreground uppercase tracking-widest">No configurations set</h3>
                                </TableCell>
                            </TableRow>
                        ) : (
                            configs.map((config) => {
                                const isBoolean = typeof config.value === 'boolean';
                                const valueStr = typeof config.value === 'object' ? JSON.stringify(config.value) : String(config.value);

                                return (
                                    <TableRow key={config.id} className="group">
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm font-bold text-indigo-700 tracking-tight">{config.key}</span>
                                                </div>
                                                {config.description && <p className="text-[10px] text-muted-foreground leading-tight">{config.description}</p>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {isBoolean ? (
                                                <Badge variant={config.value ? "default" : "secondary"} className={cn(
                                                    "uppercase text-[9px] font-black tracking-widest px-2 py-0.5",
                                                    config.value ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                                                )}>
                                                    {String(config.value)}
                                                </Badge>
                                            ) : (
                                                <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[400px] block">
                                                    {valueStr}
                                                </code>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600" onClick={() => setEditingConfig(config)}>
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => setDeletingConfig(config)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Edit Modal */}
            <Dialog open={!!editingConfig} onOpenChange={(open) => !open && setEditingConfig(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Configuration</DialogTitle>
                        <DialogDescription>Update the value for {editingConfig?.key}.</DialogDescription>
                    </DialogHeader>
                    {editingConfig && (
                        <ConfigForm 
                            initialData={editingConfig}
                            onSubmit={(data: any) => setMutation.mutate(data)}
                            onCancel={() => setEditingConfig(null)}
                            isSaving={setMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!deletingConfig} onOpenChange={(open) => !open && setDeletingConfig(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the configuration key "{deletingConfig?.key}". This could lead to application errors if the key is still being used by the frontend or backend.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            className="bg-rose-600 hover:bg-rose-700"
                            onClick={() => deletingConfig && deleteMutation.mutate(deletingConfig.id)}
                        >
                            Confirm Deletion
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// --- Main Page ---
export default function SettingsPage() {
    return (
        <div className="container mx-auto py-8 space-y-8 max-w-7xl">
            <div className="flex items-center justify-between border-b pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground mt-1">Configure global application behavior and promotional content.</p>
                </div>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Settings className="w-6 h-6 animate-[spin_4s_linear_infinite]" />
                </div>
            </div>

            <Tabs defaultValue="banners" className="space-y-6">
                <TabsList className="bg-slate-100/80 p-1 rounded-xl">
                    <TabsTrigger value="banners" className="rounded-lg px-6 py-2 content-config-tab">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Home Banners
                    </TabsTrigger>
                    <TabsTrigger value="configs" className="rounded-lg px-6 py-2 content-config-tab">
                        <Key className="w-4 h-4 mr-2" />
                        App Configuration
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="banners" className="mt-0">
                    <BannersTab />
                </TabsContent>

                <TabsContent value="configs" className="mt-0">
                    <ConfigTab />
                </TabsContent>
            </Tabs>

            <style jsx global>{`
                .content-config-tab[data-state='active'] {
                    background-color: white !important;
                    color: #4f46e5 !important;
                    box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05) !important;
                }
            `}</style>
        </div>
    );
}
