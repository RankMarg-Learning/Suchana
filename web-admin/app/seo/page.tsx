'use client';

import { useState } from 'react';
import {
    Search,
    Globe,
    Copy,
    Check,
    Plus,
    Edit2,
    Trash2,
    Layout,
    Eye,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { seoService, revalidationService, SeoPage } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSearchParams, usePathname } from 'next/navigation';
import { SEO_PAGE_CATEGORIES } from '@/constants/enums';

// Shadcn UI
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const BASE_URL = 'https://examsuchana.in';

export default function SeoPagesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    // Filters from URL
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'ALL';
    const trendingFilter = searchParams.get('trending') || 'ALL';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
    const [deletingPage, setDeletingPage] = useState<SeoPage | null>(null);

    // Combobox State
    const [categorySearch, setCategorySearch] = useState('');
    const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);

    const filteredCategories = SEO_PAGE_CATEGORIES.filter(cat =>
        cat.toLowerCase().includes(categorySearch.toLowerCase())
    );

    // Update URL helper
    const updateQuery = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === 'ALL' || (key === 'page' && value === '1')) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`${pathname}?${params.toString()}`);
    };

    const { data: response, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['seo-pages-admin', page, search, category, trendingFilter],
        queryFn: () => seoService.getAllPages({
            page,
            limit,
            search: search || undefined,
            category: category === 'ALL' ? undefined : category,
            isTrending: trendingFilter === 'TRENDING' ? 'true' :
                trendingFilter === 'NORMAL' ? 'false' : undefined
        }),
    });

    const pagesResult = response?.data;
    const pages = pagesResult?.pages || [];
    const totalCount = pagesResult?.total || 0;
    const totalPages = pagesResult?.totalPages || 0;

    const deleteMutation = useMutation({
        mutationFn: (id: string) => seoService.deletePage(id),
        onSuccess: async (_, id) => {
            toast.success('Article deleted');
            queryClient.invalidateQueries({ queryKey: ['seo-pages-admin'] });
            
            // Revalidate frontend
            const deletedPage = pages.find((p: any) => p.id === id);
            if (deletedPage) {
                try {
                    await revalidationService.triggerRevalidation(['/', '/articles', `/${deletedPage.slug}`]);
                } catch (err) {}
            }
            
            setDeletingPage(null);
        },
        onError: () => toast.error('Failed to delete article')
    });

    const copyToClipboard = (slug: string) => {
        const url = `${BASE_URL}/${slug}`;
        navigator.clipboard.writeText(url);
        setCopiedSlug(slug);
        toast.success('Link copied');
        setTimeout(() => setCopiedSlug(null), 2000);
    };

    return (
        <div className="space-y-6 container mx-auto py-2">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
                    <p className="text-muted-foreground">Manage your knowledge base and SEO articles</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading || isRefetching}>
                        <RefreshCw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
                    </Button>
                    <Button onClick={() => router.push('/articles/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Article
                    </Button>
                </div>
            </div>


            <Card>
                <CardHeader>
                    <CardTitle>Article Management</CardTitle>
                    <div className="flex items-center gap-4 pt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search articles..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => updateQuery({ search: e.target.value, page: '1' })}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Category:</span>
                            <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={isCategoryPopoverOpen}
                                        className="w-[220px] justify-between font-normal h-9 px-3"
                                    >
                                        <span className="truncate">
                                            {category === 'ALL'
                                                ? "All Categories"
                                                : category.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                        </span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[220px] p-0 shadow-2xl" align="start">
                                    <div className="flex items-center border-b px-3 py-2">
                                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-muted-foreground" />
                                        <input
                                            placeholder="Search categories..."
                                            className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                        />
                                    </div>
                                    <ScrollArea className="h-[250px] py-1">
                                        <div className="px-1">
                                            <button
                                                className={cn(
                                                    "relative flex w-full cursor-default select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors",
                                                    category === 'ALL' && "bg-accent/50 font-medium text-primary"
                                                )}
                                                onClick={() => {
                                                    updateQuery({ category: 'ALL', page: '1' });
                                                    setIsCategoryPopoverOpen(false);
                                                    setCategorySearch('');
                                                }}
                                            >
                                                All Categories
                                                {category === 'ALL' && <Check className="ml-auto h-4 w-4 opacity-100 text-primary" />}
                                            </button>

                                            {filteredCategories.map((cat) => (
                                                <button
                                                    key={cat}
                                                    className={cn(
                                                        "relative flex w-full cursor-default select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors",
                                                        category === cat && "bg-accent/50 font-medium text-primary"
                                                    )}
                                                    onClick={() => {
                                                        updateQuery({ category: cat, page: '1' });
                                                        setIsCategoryPopoverOpen(false);
                                                        setCategorySearch('');
                                                    }}
                                                >
                                                    {cat.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                                                    {category === cat && <Check className="ml-auto h-4 w-4 opacity-100 text-primary" />}
                                                </button>
                                            ))}
                                            {filteredCategories.length === 0 && (
                                                <p className="p-4 text-xs text-center text-muted-foreground">No matches.</p>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Status:</span>
                            <Select
                                value={trendingFilter}
                                onValueChange={(val) => updateQuery({ trending: val, page: '1' })}
                            >
                                <SelectTrigger className="w-[140px] h-9">
                                    <SelectValue placeholder="All Articles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Articles</SelectItem>
                                    <SelectItem value="TRENDING">Trending Only</SelectItem>
                                    <SelectItem value="NORMAL">Regular Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : pages.length > 0 ? (
                                pages.map((pageItem: SeoPage) => (
                                    <TableRow key={pageItem.id}>
                                        <TableCell className="font-medium truncate max-w-[280px]" title={pageItem.title}>
                                            <div className="flex items-center gap-2">
                                                <span className="truncate">{pageItem.title}</span>
                                                {pageItem.isTrending && (
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px] h-4 px-1 py-0 uppercase tracking-wider font-bold shrink-0">
                                                        Trending
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground truncate max-w-[180px]" title={pageItem.slug}>
                                            /{pageItem.slug}
                                        </TableCell>
                                        <TableCell className="w-[100px]">
                                            <Badge variant={pageItem.isPublished ? "default" : "secondary"}>
                                                {pageItem.isPublished ? 'Live' : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(pageItem.updatedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(pageItem.slug)}>
                                                    {copiedSlug === pageItem.slug ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => router.push(`/article/${pageItem.slug}/edit`)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        seoService.updatePage(pageItem.id!, { isTrending: !pageItem.isTrending })
                                                            .then(async () => {
                                                                toast.success(`Article marked as ${!pageItem.isTrending ? 'trending' : 'normal'}`);
                                                                queryClient.invalidateQueries({ queryKey: ['seo-pages-admin'] });
                                                                
                                                                try {
                                                                    await revalidationService.triggerRevalidation(['/', '/articles', `/${pageItem.slug}`]);
                                                                } catch (err) {}
                                                            })
                                                            .catch(() => toast.error('Failed to update trending status'));
                                                    }}
                                                    title={pageItem.isTrending ? "Remove from Trending" : "Mark as Trending"}
                                                >
                                                    <RefreshCw className={cn("h-4 w-4", pageItem.isTrending ? "text-amber-500" : "text-muted-foreground")} />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => setDeletingPage(pageItem)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No articles found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount} entries
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuery({ page: (page - 1).toString() })}
                                disabled={page === 1 || isLoading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>
                            <div className="text-sm font-medium">
                                Page {page} of {totalPages || 1}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuery({ page: (page + 1).toString() })}
                                disabled={page === totalPages || totalPages === 0 || isLoading}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={!!deletingPage} onOpenChange={(open) => !open && setDeletingPage(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the article "/{deletingPage?.slug}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => deletingPage && deleteMutation.mutate(deletingPage.id!)}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
