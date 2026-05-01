'use client';

import { useState } from 'react';
import {
    ArrowLeft,
    Save,
    Loader2,
    Calendar as CalendarIcon,
    Globe,
    Share2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    EXAM_CATEGORIES,
    EXAM_LEVELS,
    EXAM_STATUSES,
} from '@/constants/enums';
import { ApiResponse, Exam, examService, authorService, revalidationService } from '@/lib/api';
import { toast } from 'sonner';

// Shadcn UI
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

import TimelineManager from './TimelineManager';
import MarkdownRenderer from '../MarkdownRenderer';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ViralShareDialog from './ViralShareDialog';
import FAQEditor from '../articles/FAQEditor';

const examSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    shortTitle: z.string().min(2, "Short title is required"),
    conductingBody: z.string().min(2, "Authority name is required"),
    category: z.string().min(1, "Category is required"),
    examLevel: z.string().min(1, "Level is required"),
    state: z.string().nullable(),
    description: z.string().nullable(),
    qualificationCriteria: z.string().nullable(),
    totalVacancies: z.string().nullable(),
    salary: z.string().nullable(),
    age: z.string().nullable(),
    officialWebsite: z.string().nullable(),
    notificationUrl: z.string().nullable(),
    applicationFee: z.string().nullable(),
    additionalDetails: z.string().nullable(),
    status: z.string().min(1),
    isPublished: z.boolean(),
    isTrending: z.boolean(),
    publishedAt: z.string().nullable(),
    createdAt: z.string().nullable(),
    authorId: z.string().nullable().optional(),
    faqs: z.array(z.object({ question: z.string(), answer: z.string() })).nullable().optional(),
});

type ExamFormValues = z.infer<typeof examSchema>;

interface ExamFormProps {
    initialData?: ApiResponse<Exam> | Exam | any;
    isEdit?: boolean;
    slug?: string;
}

export default function ExamForm({ initialData = null, isEdit = false }: ExamFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const actualInitialData = (initialData as any)?.data && !(initialData as any).title ? (initialData as any).data : initialData;

    const {
        register,
        handleSubmit,
        control,
        watch,
        getValues,
        setValue,
        formState: { errors }
    } = useForm<ExamFormValues>({
        resolver: zodResolver(examSchema),
        defaultValues: {
            title: actualInitialData?.title || '',
            shortTitle: actualInitialData?.shortTitle || '',
            conductingBody: actualInitialData?.conductingBody || '',
            category: actualInitialData?.category || 'GOVERNMENT_JOBS',
            examLevel: actualInitialData?.examLevel || 'NATIONAL',
            state: actualInitialData?.state || '',
            description: actualInitialData?.description || '',
            qualificationCriteria: actualInitialData?.qualificationCriteria || '',
            totalVacancies: actualInitialData?.totalVacancies || '',
            salary: actualInitialData?.salary || '',
            age: actualInitialData?.age || '',
            officialWebsite: actualInitialData?.officialWebsite || '',
            notificationUrl: actualInitialData?.notificationUrl || '',
            applicationFee: actualInitialData?.applicationFee || '',
            additionalDetails: actualInitialData?.additionalDetails || '',
            status: actualInitialData?.status || 'NOTIFICATION',
            isPublished: actualInitialData?.isPublished ?? true,
            isTrending: actualInitialData?.isTrending ?? false,
            publishedAt: actualInitialData?.publishedAt || '',
            createdAt: actualInitialData?.createdAt || '',
            authorId: actualInitialData?.authorId || (actualInitialData as any)?.author?.id || null,
            faqs: actualInitialData?.faqs || [],
        }
    });

    const { data: authors } = useQuery({
        queryKey: ['authors'],
        queryFn: () => authorService.getAll()
    });

    const mutation = useMutation({
        mutationFn: async (values: ExamFormValues) => {
            const payload = { ...values };
            Object.keys(payload).forEach(key => {
                if ((payload as any)[key] === '') {
                    (payload as any)[key] = null;
                }
            });

            if (isEdit && actualInitialData?.id) {
                return await examService.updateExam(actualInitialData.id, payload as any);
            } else {
                return await examService.createExam(payload as any);
            }
        },
        onSuccess: async () => {
            toast.success(isEdit ? 'Exam updated' : 'Exam created');
            queryClient.invalidateQueries({ queryKey: ['exams'] });

            // Trigger frontend cache revalidation
            try {
                // Revalidate the specific exam page and the main listing pages
                const pathsToRevalidate = ['/', '/all-exams'];
                if (actualInitialData?.slug) {
                    pathsToRevalidate.push(`/exam/${actualInitialData.slug}`);
                }
                const currentSlug = actualInitialData?.slug || getValues('shortTitle')?.toLowerCase().replace(/\s+/g, '-');
                if (currentSlug && currentSlug !== actualInitialData?.slug) {
                    pathsToRevalidate.push(`/exam/${currentSlug}`);
                }

                await revalidationService.triggerRevalidation({
                    paths: pathsToRevalidate,
                    tag: 'exams-list'
                });
                toast.success('Frontend cache updated instantly');
            } catch (err) {
                console.error("Failed to revalidate:", err);
            }

            router.push('/exams');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error?.message || 'Failed to save exam');
        }
    });

    const isPublished = watch('isPublished');
    const isTrending = watch('isTrending');
    const examLevel = watch('examLevel');

    // Sharing State
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

    // Watch fields for markdown previews
    const description = watch('description');
    const qualificationCriteria = watch('qualificationCriteria');
    const totalVacancies = watch('totalVacancies');
    const salary = watch('salary');
    const age = watch('age');
    const applicationFee = watch('applicationFee');
    const additionalDetails = watch('additionalDetails');

    const onSubmit = (values: ExamFormValues) => {
        mutation.mutate(values);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 container mx-auto py-4 md:py-8">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b pb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild type="button" className="shrink-0">
                        <Link href="/exams">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold line-clamp-1">{isEdit ? 'Edit Exam' : 'Create New Exam'}</h1>
                        <p className="text-xs md:text-sm text-muted-foreground">Manage exam details and recruitment lifecycle</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {isEdit && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 h-9"
                            onClick={() => setIsShareDialogOpen(true)}
                        >
                            <Share2 className="mr-2 h-4 w-4" />
                            <span className="hidden xs:inline">Share Strategy</span>
                            <span className="xs:hidden">Share</span>
                        </Button>
                    )}
                    <div className="flex items-center space-x-2 bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-100">
                        <Switch
                            id="trending"
                            checked={isTrending}
                            onCheckedChange={(checked) => setValue('isTrending', checked)}
                            className="data-[state=checked]:bg-amber-500 scale-75 md:scale-100"
                        />
                        <Label htmlFor="trending" className="text-amber-700 font-bold text-[10px] md:text-xs uppercase tracking-tight">Trending</Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200">
                        <Switch
                            id="published"
                            checked={isPublished}
                            onCheckedChange={(checked) => setValue('isPublished', checked)}
                            className="scale-75 md:scale-100"
                        />
                        <Label htmlFor="published" className="text-slate-600 font-bold text-[10px] md:text-xs uppercase tracking-tight">{isPublished ? 'Published' : 'Draft'}</Label>
                    </div>
                    <Button type="submit" disabled={mutation.isPending} size="sm" className="h-9 px-4">
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save <span className="hidden sm:inline ml-1">Exam</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Core identity and conducting authority details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Exam Title *</Label>
                                <Input id="title" {...register('title')} placeholder="Full official name of the exam" />
                                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="shortTitle">Short Title / Code *</Label>
                                    <Input id="shortTitle" {...register('shortTitle')} placeholder="e.g. UPSC CSE" />
                                    {errors.shortTitle && <p className="text-sm text-destructive">{errors.shortTitle.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="conductingBody">Conducting Body *</Label>
                                    <Input id="conductingBody" {...register('conductingBody')} placeholder="e.g. UPSC" />
                                    {errors.conductingBody && <p className="text-sm text-destructive">{errors.conductingBody.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded-md">
                                    <Globe className="h-4 w-4" />
                                    <span>/{actualInitialData?.slug || 'auto-generated'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Exam Timeline</CardTitle>
                            <CardDescription>Manage application dates and exam schedule</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isEdit && actualInitialData?.id ? (
                                <TimelineManager examId={actualInitialData.id} initialEvents={actualInitialData.lifecycleEvents} />
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <p className="text-muted-foreground">Save the exam first to manage the timeline.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Fees</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea {...register('applicationFee')} placeholder="Fee details..." className="min-h-[100px] resize-y" />
                                {applicationFee && (
                                    <div className="p-3 border rounded-md bg-muted/5 text-xs overflow-y-auto custom-scrollbar max-h-[150px] min-h-[125px]">
                                        <MarkdownRenderer content={applicationFee} variant="fact" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Qualification Criteria</CardTitle>
                                <CardDescription>Educational and other eligibility requirements...</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="qualificationCriteria">Qualification Criteria</Label>
                                    <Textarea id="qualificationCriteria" {...register('qualificationCriteria')} placeholder="Educational and other eligibility requirements..." className="min-h-[120px]" />
                                </div>
                                {qualificationCriteria && (
                                    <div className="space-y-2 flex-1 flex flex-col">
                                        <Label className="text-muted-foreground flex items-center gap-2">Preview <div className="h-px flex-1 bg-border/50" /></Label>
                                        <div className="p-4 border rounded-md bg-muted/5 flex-1 min-h-[150px] overflow-y-auto custom-scrollbar shadow-inner">
                                            <MarkdownRenderer content={qualificationCriteria} variant="fact" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Description & Qualification</CardTitle>
                                <CardDescription>Detailed information about the recruitment process</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="description">Short Description</Label>
                                    <Textarea id="description" {...register('description')} placeholder="Summarize the exam..." className="min-h-[150px]" />
                                </div>
                                {description && (
                                    <div className="space-y-2 flex-1 flex flex-col">
                                        <Label className="text-muted-foreground flex items-center gap-2">Preview <div className="h-px flex-1 bg-border/50" /></Label>
                                        <div className="p-4 border rounded-md bg-muted/5 flex-1 min-h-[190px] overflow-y-auto custom-scrollbar shadow-inner">
                                            <MarkdownRenderer content={description} />
                                        </div>
                                    </div>
                                )}
                                <Separator />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Other Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea {...register('additionalDetails')} placeholder="Any other relevant information..." className="min-h-[100px] resize-y" />
                                {additionalDetails && (
                                    <div className="p-3 border rounded-md bg-muted/5 text-xs overflow-y-auto custom-scrollbar max-h-[150px] min-h-[125px]">
                                        <MarkdownRenderer content={additionalDetails} variant="fact" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Exam FAQs</CardTitle>
                            <CardDescription>Address common candidate queries for this specific recruitment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Controller
                                name="faqs"
                                control={control}
                                render={({ field }) => (
                                    <FAQEditor
                                        faqs={field.value || []}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Categorization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EXAM_CATEGORIES.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat.replace(/_/g, ' ')}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Level</Label>
                                <Controller
                                    name="examLevel"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                if (val !== 'STATE') setValue('state', null);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EXAM_LEVELS.map(level => (
                                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {examLevel === 'STATE' && (
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" {...register('state')} placeholder="e.g. Maharashtra" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Current status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {EXAM_STATUSES.map(s => (
                                                    <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Author</Label>
                                <Controller
                                    name="authorId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value || 'none'} onValueChange={(val) => field.onChange(val === 'none' ? null : val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select author" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {authors?.data?.map(author => (
                                                    <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Key Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Vacancies</Label>
                                <Textarea {...register('totalVacancies')} placeholder="e.g. 500+" className="min-h-[60px] resize-y" />
                                {totalVacancies && (
                                    <div className="p-2 border rounded bg-muted/5 text-[11px] overflow-y-auto custom-scrollbar max-h-[120px] min-h-[75px]">
                                        <MarkdownRenderer content={totalVacancies} variant="fact" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Salary</Label>
                                <Textarea {...register('salary')} placeholder="e.g. Pay Level 10" className="min-h-[60px] resize-y" />
                                {salary && (
                                    <div className="p-2 border rounded bg-muted/5 text-[11px] overflow-y-auto custom-scrollbar max-h-[120px] min-h-[75px]">
                                        <MarkdownRenderer content={salary} variant="fact" />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Age Limit</Label>
                                <Textarea {...register('age')} placeholder="e.g. 21 - 32 years" className="min-h-[60px] resize-y" />
                                {age && (
                                    <div className="p-2 border rounded bg-muted/5 text-[11px] overflow-y-auto custom-scrollbar max-h-[120px] min-h-[75px]">
                                        <MarkdownRenderer content={age} variant="fact" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Official Website</Label>
                                <Input {...register('officialWebsite')} placeholder="https://..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Notification PDF URL</Label>
                                <Input {...register('notificationUrl')} placeholder="https://..." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Publication</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Published At</Label>
                                <Controller
                                    name="publishedAt"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString() || null)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Created / Listed At</Label>
                                <Controller
                                    name="createdAt"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(new Date(field.value), "PPP") : <span>Original listing timestamp</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString() || null)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ViralShareDialog
                isOpen={isShareDialogOpen}
                onOpenChange={setIsShareDialogOpen}
                formData={getValues()}
                initialData={actualInitialData}
            />
        </form>
    );
}
