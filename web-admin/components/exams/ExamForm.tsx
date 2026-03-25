'use client';

import { useState } from 'react';
import {
    ArrowLeft,
    Save,
    Terminal,
    Layers,
    Link as LinkIcon,
    Info,
    CheckCircle2,
    ArrowRight,
    Loader2,
    BookOpen,
    Building2,
    Calendar,
    Briefcase,
    Zap,
    Layout,
    ShieldCheck,
    MapPin,
    FileText,
    Fingerprint,
    Globe,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    EXAM_CATEGORIES,
    EXAM_LEVELS,
    EXAM_STATUSES,
} from '@/constants/enums';
import { ApiResponse, Exam, LifecycleEvent, examService, lifecycleService } from '@/lib/api';
import { ExamCategory, ExamLevel, ExamStatus, LifecycleStage } from '@/constants/enums';
import { toast } from 'sonner';

import { CustomSelect } from '@/components/ui/CustomSelect';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/DatePicker';
import { Calendar as CalendarIcon } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import TimelineManager from './TimelineManager';
import { useForm, Controller, SubmitHandler, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const examSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    shortTitle: z.string().min(2, "Short title is required"),
    conductingBody: z.string().min(2, "Authority name is required"),
    category: z.string().min(1, "Category is required"),
    examLevel: z.string().min(1, "Level is required"),
    state: z.string().nullish(),
    description: z.string().nullish(),
    qualificationCriteria: z.string().nullish(),
    totalVacancies: z.string().nullish(),
    salary: z.string().nullish(),
    age: z.string().nullish(),
    officialWebsite: z.string().nullish(),
    notificationUrl: z.string().nullish(),
    applicationFee: z.string().nullish(),
    additionalDetails: z.string().nullish(),
    status: z.string().default('NOTIFICATION'),
    isPublished: z.boolean().default(true),
    publishedAt: z.string().nullish(),
});

type ExamFormValues = z.infer<typeof examSchema>;

interface ExamFormProps {
    initialData?: ApiResponse<Exam> | Exam | any;
    isEdit?: boolean;
    slug?: string;
}

export default function ExamForm({ initialData = null, isEdit = false, slug = '' }: ExamFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    
    // Robust data extraction from the API envelope
    const actualInitialData = (initialData as any)?.data && !(initialData as any).title ? (initialData as any).data : initialData;

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
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
            publishedAt: actualInitialData?.publishedAt || '',
        }
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
        onSuccess: () => {
            toast.success(isEdit ? 'Execution updated successfully' : 'New execution created');
            queryClient.invalidateQueries({ queryKey: ['exams'] });
            router.push('/exams');
        },
        onError: (error: any) => {
            console.error('Mutation failed:', error);
            const errorMsg = error.response?.data?.message || 'Failed to save changes';
            toast.error(errorMsg);
        }
    });

    const isPublished = watch('isPublished');
    const examLevel = watch('examLevel');

    const onSubmit = (values: FieldValues) => {
        mutation.mutate(values as ExamFormValues);
    };

    const handleFormSubmit = () => {
        handleSubmit(onSubmit)();
    };

    const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block ml-1";
    const inputClasses = "w-full bg-white border border-gray-200 rounded-lg py-3 px-4 outline-none focus:border-primary transition-all text-sm font-bold shadow-sm";

    return (
        <div className="space-y-6 pb-20 max-w-[1600px] mx-auto">
            {/* Header Action Bar */}
            <div className="flex items-center justify-between sticky top-0 z-50 bg-gray-50/80 backdrop-blur-md py-4 border-b border-gray-200 -mx-4 px-4 sm:-mx-8 sm:px-8">
                <div className="flex items-center gap-4">
                    <Link href="/exams" className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-xl shadow-sm border-gray-200")}>
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black font-outfit uppercase tracking-tight text-gray-900 leading-none">{isEdit ? 'Edit Exam' : 'Create New Exam'}</h1>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] font-mono mt-1">Admin Execution Layer</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        type="button"
                        onClick={() => setValue('isPublished', !isPublished)}
                        className={cn(
                            "px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2",
                            isPublished
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/10 hover:bg-emerald-100/50"
                                : "bg-white text-gray-400 border-gray-100"
                        )}
                    >
                        <Globe className="w-3.5 h-3.5" />
                        {isPublished ? 'Public' : 'Draft'}
                    </Button>
                    <Button
                        onClick={handleFormSubmit}
                        disabled={mutation.isPending}
                        className="px-8 h-10 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] gap-3 shadow-xl shadow-indigo-500/20"
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Execution
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 items-start">
                {/* Main Content Area */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Core Identity */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
                        <div className="px-6 py-3 bg-gray-50/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Fingerprint className="w-3.5 h-3.5 text-primary" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">Core Identity</h3>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className={errors.title ? "text-destructive" : ""}>Full Exam Title</Label>
                                    <Input
                                        {...register('title')}
                                        placeholder="UPSC Civil Services 2025"
                                        className={cn('rounded-sm', errors.title && "border-destructive")}
                                    />
                                    {errors.title && <p className="text-[10px] text-destructive font-bold">{errors.title.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className={errors.conductingBody ? "text-destructive" : ""}>Conducting Authority</Label>
                                    <Input
                                        {...register('conductingBody')}
                                        placeholder="Public Service Commission"
                                        className={cn('rounded-sm', errors.conductingBody && "border-destructive")}
                                    />
                                    {errors.conductingBody && <p className="text-[10px] text-destructive font-bold">{errors.conductingBody.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className={errors.shortTitle ? "text-destructive" : ""}>Short Signature</Label>
                                    <Input
                                        {...register('shortTitle')}
                                        placeholder="UPSC CSE"
                                        className={cn('rounded-sm', errors.shortTitle && "border-destructive")}
                                    />
                                    {errors.shortTitle && <p className="text-[10px] text-destructive font-bold">{errors.shortTitle.message}</p>}
                                </div>
                                <div className="space-y-1.5 opacity-60">
                                    <Label>URL Identifier (Slug)</Label>
                                    <div className="flex items-center gap-2 bg-gray-100/50 border border-gray-100 rounded-xl py-2.5 px-4 text-[11px] text-gray-400">
                                        <Globe className="w-3 h-3" />
                                        <span>/exams/{actualInitialData?.slug || 'auto-generated'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rich Details */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-8">
                        <div className='space-y-2'>
                            <Label> Exam Description</Label>
                            <Textarea
                                {...register('description')}
                                placeholder="Describe the exam scope..."
                                className="!border-none !pb-0"
                            />
                        </div>


                        <div className="h-px bg-gray-50" />
                        <div className='space-y-2'>
                            <Label> Eligibility</Label>
                            <Textarea
                                {...register('qualificationCriteria')}
                                placeholder="Selection & qualification data..."
                                className="!border-none !pb-0"
                            />
                        </div>
                    </div>

                    {/* Timeline Interaction */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 overflow-hidden">
                        {isEdit && actualInitialData?.id ? (
                            <TimelineManager examId={actualInitialData.id} initialEvents={actualInitialData.lifecycleEvents} />
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-4 bg-gray-200 rounded-full" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Lifecycle Roadmap</h4>
                                </div>
                                <div className="bg-gray-50/50 border border-dashed border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-2">
                                    <Zap className="w-5 h-5 text-gray-200 animate-pulse" />
                                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest max-w-[200px]">Save this exam first to activate the lifecycle roadmap system</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-2">
                            <Label>Application Fees</Label>
                            <Textarea
                                {...register('applicationFee')}
                                placeholder="GEN: 100..."
                                className="!border-none !pb-0"
                            />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-2">
                            <Label>Additional Details</Label>
                            <Textarea
                                {...register('additionalDetails')}
                                placeholder="Misc data..."
                                className="!border-none !pb-0"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Categorization */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm divide-y divide-gray-50">
                        <div className="px-6 py-4 bg-gray-50/30">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                Taxonomy
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Category</label>
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={EXAM_CATEGORIES}
                                            className="!border-gray-100 !bg-gray-50/50 !rounded-xl"
                                        />
                                    )}
                                />
                                {errors.category && <p className="text-[10px] text-destructive font-bold">{errors.category.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Exam Level</label>
                                <Controller
                                    name="examLevel"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomSelect
                                            value={field.value}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                if (val !== 'STATE') setValue('state', null);
                                            }}
                                            options={EXAM_LEVELS}
                                            className="!border-gray-100 !bg-gray-50/50 !rounded-xl"
                                        />
                                    )}
                                />
                                {errors.examLevel && <p className="text-[10px] text-destructive font-bold">{errors.examLevel.message}</p>}
                            </div>
                            {examLevel === 'STATE' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Region/State</label>
                                    <Input
                                        {...register('state')}
                                        placeholder="Ex: Bihar, Delhi"
                                        className="bg-gray-50/50 border-gray-100 rounded-xl"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Specifics */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
                        <div className="px-6 py-3 bg-emerald-50/10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700 flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5" />
                                Particulars
                            </h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Total Vacancies</Label>
                                <Textarea
                                    {...register('totalVacancies')}
                                    placeholder="500 positions"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Salary Grade</Label>
                                <Textarea
                                    {...register('salary')}
                                    placeholder="Level 10..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Age Spectrum</Label>
                                <Textarea
                                    {...register('age')}
                                    placeholder="21-32 years..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Utility Links */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
                        <div className="px-6 py-3 bg-blue-50/10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-700 flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5" />
                                Navigation
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Official Portal</label>
                                <div className="relative group">
                                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-100 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        {...register('officialWebsite')}
                                        placeholder="https://..."
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 text-xs font-black text-gray-900 transition-all font-mono"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Notification PDF</label>
                                <div className="relative group">
                                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-100 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        {...register('notificationUrl')}
                                        placeholder="https://..."
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 text-xs font-black text-gray-900 transition-all font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Publication Detail */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
                        <div className="px-6 py-3 bg-purple-50/10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-700 flex items-center gap-2">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                Publication Detail
                            </h3>
                        </div>
                        <div className="p-6">
                            <Controller
                                name="publishedAt"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Published At"
                                        date={field.value || undefined}
                                        onChange={(date) => field.onChange(date?.toISOString() || null)}
                                        placeholder="Auto-set on publish"
                                    />
                                )}
                            />
                            <p className="mt-2 text-[8px] text-gray-400 font-medium px-1 italic">
                                Note: This date determines visibility.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
