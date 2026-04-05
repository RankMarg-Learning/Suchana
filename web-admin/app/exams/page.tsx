'use client';

import { useState } from 'react';
import {
    Search,
    Plus,
    ChevronLeft,
    ChevronRight,
    Globe,
    Edit3,
    Trash2,
    Layers,
    RefreshCw,
    MoreHorizontal,
    Eye,
    Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { examService, seoService, Exam } from '@/lib/api';
import { EXAM_STATUSES } from '@/constants/enums';
import { toast } from 'sonner';
import SummaryStats from '@/components/exams/SummaryStats';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
// Re-checking list_dir, checkbox.tsx was missing. I'll use standard input type="checkbox" or Switch.
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SEO_CATEGORIES = [
    { id: 'NOTIFICATION', label: 'Notification PDF' },
    { id: 'VACANCIES', label: 'Vacancy Details' },
    { id: 'ELIGIBILITY', label: 'Eligibility Criteria' },
    { id: 'SALARY', label: 'Salary/Job Profile' },
    { id: 'SYLLABUS', label: 'Syllabus/Exam Pattern' },
    { id: 'SELECTION_PROCESS', label: 'Selection Process' },
    { id: 'ADMIT_CARD', label: 'Admit Card' },
    { id: 'RESULTS', label: 'Results' },
    { id: 'CUT_OFF', label: 'Cut Off Marks' },
    { id: 'ANSWER_KEY', label: 'Answer Key' },
    { id: 'STAGES', label: 'Lifecycle Stages' },
];

const PAGE_SIZE = 15;

export default function ExamsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [publishFilter, setPublishFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deletingExam, setDeletingExam] = useState<Exam | null>(null);
    const [generatingSeoExam, setGeneratingSeoExam] = useState<Exam | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(SEO_CATEGORIES.map(c => c.id));

    // Main query for the paginated & filtered list
    const { data: response, isLoading, isRefetching } = useQuery({
        queryKey: ['exams', currentPage, search, statusFilter, publishFilter, startDate, endDate],
        queryFn: () => examService.getAllExams({
            page: currentPage,
            limit: PAGE_SIZE,
            search: search || undefined,
            status: statusFilter === 'ALL' ? undefined : statusFilter,
            isPublished: publishFilter === 'PUBLISHED' ? 'true' :
                publishFilter === 'UNPUBLISHED' ? 'false' : undefined,
            startDate: startDate ? new Date(startDate).toISOString() : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined
        }),
    });

    const exams = response?.data || [];
    const meta = (response as any)?.meta;
    const totalPages = meta?.totalPages || 1;
    const totalCount = meta?.total || 0;

    const { data: globalResponse } = useQuery({
        queryKey: ['exams-global-stats'],
        queryFn: () => examService.getAllExams({ limit: 1 }),
        staleTime: 60000,
    });

    const globalCount = (globalResponse as any)?.meta?.total || 0;

    // Mutation for publish toggle
    const publishMutation = useMutation({
        mutationFn: ({ id, isPublished }: { id: string, isPublished: boolean }) =>
            examService.updateExam(id, { isPublished }),
        onSuccess: (_, variables) => {
            toast.success(`Exam ${variables.isPublished ? 'published' : 'unpublished'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['exams'] });
        },
        onError: () => toast.error('Failed to update published status')
    });

    // Mutation for deletion
    const deleteMutation = useMutation({
        mutationFn: (id: string) => examService.deleteExam(id),
        onSuccess: () => {
            toast.success('Exam deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['exams'] });
            setDeletingExam(null);
        },
        onError: () => toast.error('Failed to delete exam')
    });

    const generateSeoMutation = useMutation({
        mutationFn: ({ examId, categories }: { examId: string, categories: string[] }) =>
            seoService.generateExamPages(examId, categories),
        onSuccess: (response) => {
            toast.success(`Generated ${response.data.generatedCount} SEO pages successfully`);
            setGeneratingSeoExam(null);
        },
        onError: () => toast.error('Failed to generate SEO pages')
    });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'ACTIVE':
            case 'REGISTRATION_OPEN':
                return "default"; // emerald in our theme
            case 'NOTIFICATION':
                return "secondary"; // indigo/blue
            case 'RESULT_DECLARED':
                return "outline"; // yellow
            case 'ADMIT_CARD_OUT':
                return "outline"; // purple
            default:
                return "secondary";
        }
    };

    return (
        <div className="space-y-6 container mx-auto py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Exams</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Reviewing {globalCount} exam lifecycles and recruitment schedules.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['exams'] })}
                        disabled={isLoading || isRefetching}
                    >
                        <RefreshCw className={cn("mr-2 h-4 w-4", isRefetching && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button onClick={() => router.push('/exams/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Exam
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <SummaryStats exams={exams} loading={isLoading} />

            {/* Filter Bar */}
            <Card className="border shadow-sm">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search title, authority or slug..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Select value={publishFilter} onValueChange={(val) => { setPublishFilter(val); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Visibility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Visibility</SelectItem>
                                <SelectItem value="PUBLISHED">Published</SelectItem>
                                <SelectItem value="UNPUBLISHED">Unpublished</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                {EXAM_STATUSES.map(s => (
                                    <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                className="w-[140px]"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                            />
                            <span className="text-muted-foreground">-</span>
                            <Input
                                type="date"
                                className="w-[140px]"
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card className="border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead className="min-w-[300px]">Exam Details</TableHead>
                            <TableHead className="hidden md:table-cell">Category</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Public</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array(PAGE_SIZE).fill(0).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 rounded-full mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : exams.length > 0 ? (
                            exams.map((exam) => (
                                <TableRow key={exam.id} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        #{exam.id.substring(0, 6)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5">
                                            <Link
                                                href={`/exam/${exam.slug || exam.id}/edit`}
                                                className="font-semibold text-slate-900 hover:text-primary transition-colors line-clamp-1"
                                            >
                                                {exam.title}
                                            </Link>
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {exam.conductingBody}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-medium">
                                                {exam.category.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusVariant(exam.status)}>
                                            {exam.status.replace(/_/g, ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-8 w-8 rounded-full border transition-all",
                                                exam.isPublished ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "text-muted-foreground/30 border-transparent"
                                            )}
                                            onClick={() => publishMutation.mutate({ id: exam.id, isPublished: !exam.isPublished })}
                                            disabled={publishMutation.isPending}
                                        >
                                            <Globe className={cn("h-4 w-4", exam.isPublished ? "opacity-100" : "opacity-50")} />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                title="Copy Exam URL"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`https://examsuchana.in/exam/${exam.slug || exam.id}`);
                                                    toast.success('Link copied to clipboard!');
                                                }}
                                            >
                                                <LinkIcon className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Edit Exam">
                                                <Link href={`/exam/${exam.slug || exam.id}/edit`}>
                                                    <Edit3 className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => window.open(`https://examsuchana.in/exam/${exam.slug}`, '_blank')}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Live
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.push(`/exam/${exam.slug || exam.id}/edit`)}>
                                                        <Edit3 className="mr-2 h-4 w-4" /> Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        setGeneratingSeoExam(exam);
                                                        setSelectedCategories(SEO_CATEGORIES.map(c => c.id));
                                                    }}>
                                                        <Layers className="mr-2 h-4 w-4" /> Generate SEO
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setDeletingExam(exam)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Exam
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                                        <Search className="h-10 w-10 opacity-20" />
                                        <p className="text-sm font-medium">No results matched your filters</p>
                                        <Button variant="outline" size="sm" onClick={() => { setSearch(''); setStatusFilter('ALL'); setPublishFilter('ALL'); setStartDate(''); setEndDate(''); }}>
                                            Clear Filters
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20 border-t">
                    <div className="text-sm text-muted-foreground font-medium">
                        Showing {exams.length} of {totalCount} exams
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || isLoading}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>
                        <div className="hidden sm:flex items-center gap-1 mx-1">
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                let pageNum = 1;
                                if (totalPages <= 5) pageNum = i + 1;
                                else if (currentPage <= 3) pageNum = i + 1;
                                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = currentPage - 2 + i;

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "ghost"}
                                        size="icon"
                                        className="h-8 w-8 text-xs font-semibold"
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 1 || isLoading}
                        >
                            Next
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Deletion Dialog */}
            <AlertDialog open={!!deletingExam} onOpenChange={(open) => !open && setDeletingExam(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanent Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you absolutely sure? This will remove all lifecycle events, notifications logs, and SEO bindings associated with <span className="font-bold text-slate-900">"{deletingExam?.title}"</span>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => deletingExam && deleteMutation.mutate(deletingExam.id)}>
                            {deleteMutation.isPending ? "Deleting..." : "Delete Execution"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* SEO Generation Dialog */}
            <Dialog open={!!generatingSeoExam} onOpenChange={(open) => !open && setGeneratingSeoExam(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Generate SEO Pages</DialogTitle>
                        <DialogDescription>
                            Select the page categories you want to generate/update for <span className="font-bold text-slate-900">"{generatingSeoExam?.shortTitle || generatingSeoExam?.title}"</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        {SEO_CATEGORIES.map((cat) => (
                            <div key={cat.id} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => {
                                if (selectedCategories.includes(cat.id)) {
                                    setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                                } else {
                                    setSelectedCategories([...selectedCategories, cat.id]);
                                }
                            }}>
                                <Switch
                                    id={`cat-${cat.id}`}
                                    checked={selectedCategories.includes(cat.id)}
                                // onCheckedChange already handled by parent div click for better UX
                                />
                                <Label htmlFor={`cat-${cat.id}`} className="flex-1 cursor-pointer text-sm font-medium">
                                    {cat.label}
                                </Label>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg text-xs text-muted-foreground">
                        <span>{selectedCategories.length} categories selected</span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                            if (selectedCategories.length === SEO_CATEGORIES.length) setSelectedCategories([]);
                            else setSelectedCategories(SEO_CATEGORIES.map(c => c.id));
                        }}>
                            {selectedCategories.length === SEO_CATEGORIES.length ? 'Deselect All' : 'Select All'}
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setGeneratingSeoExam(null)}>Cancel</Button>
                        <Button
                            onClick={() => generatingSeoExam && generateSeoMutation.mutate({
                                examId: generatingSeoExam.id,
                                categories: selectedCategories
                            })}
                            disabled={generateSeoMutation.isPending || selectedCategories.length === 0}
                        >
                            {generateSeoMutation.isPending ? (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Globe className="mr-2 h-4 w-4" />
                                    Generate Pages
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
