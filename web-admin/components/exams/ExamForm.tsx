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
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface ExamFormProps {
    initialData?: ApiResponse<Exam> | Exam | any;
    isEdit?: boolean;
    slug?: string;
}

export default function ExamForm({ initialData = null, isEdit = false, slug = '' }: ExamFormProps) {
    console.log("initialData", initialData)
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const defaultDefaults = {
        title: '',
        shortTitle: '',
        slug: slug !== 'new' ? slug : '',
        conductingBody: '',
        category: 'GOVERNMENT_JOBS',
        examLevel: 'NATIONAL',
        state: '',
        description: '',
        age: '',
        lifecycleService: [],
        qualificationCriteria: '',
        totalVacancies: '',
        salary: '',
        officialWebsite: '',
        notificationUrl: '',
        applicationFee: '',
        additionalDetails: '',
        status: 'NOTIFICATION',
        isPublished: true,
    };

    // Robust data extraction from the API envelope
    const actualInitialData = (initialData as any)?.data && !(initialData as any).title ? (initialData as any).data : initialData;

    const [formData, setFormData] = useState<Partial<Exam>>({
        ...defaultDefaults,
        ...(actualInitialData || {})
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };



    const handleSubmit = async () => {
        try {
            setLoading(true);
            const payload = { ...formData };
            delete (payload as any).slug;
            delete (payload as any).qualificationLevel;

            Object.keys(payload).forEach(key => {
                if ((payload as any)[key] === '') {
                    (payload as any)[key] = null;
                }
            });

            if (isEdit && initialData?.id) {
                await examService.updateExam(initialData.id, payload);
                toast.success('Exam updated successfully');
            } else {
                await examService.createExam(payload);
                toast.success('Exam created successfully');
            }
            router.push(`/exams`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Failed to create/update exam:', error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to save exam';
            toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
        } finally {
            setLoading(false);
        }
    };

    const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 block ml-1";
    const inputClasses = "w-full bg-white border border-gray-200 rounded-lg py-3 px-4 outline-none focus:border-primary transition-all text-sm font-bold shadow-sm";

    return (
        <div className="space-y-6 pb-20 max-w-[1600px] mx-auto">
            {/* Header Action Bar */}
            <div className="flex items-center justify-between sticky top-0 z-50 bg-gray-50/80 backdrop-blur-md py-4 border-b border-gray-200 -mx-4 px-4 sm:-mx-8 sm:px-8">
                <div className="flex items-center gap-4">
                    <Link href="/exams" className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all shadow-sm">
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black font-outfit uppercase tracking-tight text-gray-900 leading-none">{isEdit ? 'Edit Exam' : 'Create New Exam'}</h1>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] font-mono mt-1">Admin Execution Layer</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border",
                            formData.isPublished
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/10"
                                : "bg-white text-gray-400 border-gray-100"
                        )}
                    >
                        <Globe className="w-3.5 h-3.5" />
                        {formData.isPublished ? 'Public' : 'Draft'}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 bg-black text-primary rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:brightness-125 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-primary/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Exam
                    </button>
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
                                    <Label >Full Exam Title</Label>
                                    <Input
                                        name="title"
                                        value={formData.title ?? ""}
                                        onChange={handleChange}
                                        placeholder="UPSC Civil Services 2025"
                                        className='rounded-sm'
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Conducting Authority</Label>
                                    <Input
                                        name="conductingBody"
                                        value={formData.conductingBody ?? ""}
                                        onChange={handleChange}
                                        placeholder="Public Service Commission"
                                        className='rounded-sm'
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label>Short Signature</Label>
                                    <Input
                                        name="shortTitle"
                                        value={formData.shortTitle ?? ""}
                                        onChange={handleChange}
                                        placeholder="UPSC CSE"
                                        className='rounded-sm'
                                    />
                                </div>
                                <div className="space-y-1.5 opacity-60">
                                    <Label>URL Identifier (Slug)</Label>
                                    <div className="flex items-center gap-2 bg-gray-100/50 border border-gray-100 rounded-xl py-2.5 px-4 text-[11px] text-gray-400">
                                        <Globe className="w-3 h-3" />
                                        <span>/exams/{formData.slug || 'auto-generated'}</span>
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
                                name="description"
                                value={formData.description ?? ""}
                                onChange={handleChange}
                                placeholder="Describe the exam scope..."
                                className="!border-none !pb-0"
                            />
                        </div>


                        <div className="h-px bg-gray-50" />
                        <div className='space-y-2'>
                            <Label> Eligibility</Label>
                            <Textarea
                                name="qualificationCriteria"
                                value={formData.qualificationCriteria ?? ""}
                                onChange={handleChange}
                                placeholder="Selection & qualification data..."
                                className="!border-none !pb-0"
                            />
                        </div>
                    </div>

                    {/* Timeline Interaction */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 overflow-hidden">
                        {isEdit && formData?.id ? (
                            <TimelineManager examId={formData.id} initialEvents={formData.lifecycleEvents} />
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
                                name="applicationFee"
                                value={formData.applicationFee ?? ""}
                                onChange={handleChange}
                                placeholder="GEN: 100..."
                                className="!border-none !pb-0"
                            />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-2">
                            <Label>Additional Details</Label>
                            <Textarea
                                name="additionalDetails"
                                value={formData.additionalDetails ?? ""}
                                onChange={handleChange}
                                placeholder="Misc data..."
                                className="!border-none !pb-0"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Categorization */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
                        <div className="px-6 py-3 bg-gray-50/30">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5 text-primary" />
                                Taxonomy
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Classification</label>
                                <CustomSelect
                                    value={formData.category ?? 'GOVERNMENT_JOBS'}
                                    onChange={(val) => setFormData({ ...formData, category: val as ExamCategory })}
                                    options={EXAM_CATEGORIES}
                                    className="!border-gray-100 !bg-gray-50/50 !rounded-xl !py-2.5"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Operation Level</Label>
                                <CustomSelect
                                    value={formData.examLevel ?? 'NATIONAL'}
                                    onChange={(val) => setFormData({ ...formData, examLevel: val as ExamLevel })}
                                    options={EXAM_LEVELS}
                                    className="!border-gray-100 !bg-gray-50/50 !rounded-xl !py-2.5"
                                />
                            </div>
                            {formData.examLevel === 'STATE' && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-1">
                                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Region/State</label>
                                    <input
                                        name="state"
                                        value={formData.state ?? ""}
                                        onChange={handleChange}
                                        placeholder="Ex: Bihar"
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-2.5 px-4 outline-none focus:border-primary text-sm font-bold shadow-sm"
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
                                    name="totalVacancies"
                                    value={formData.totalVacancies ?? ""}
                                    onChange={handleChange}
                                    placeholder="500 positions"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Salary Grade</Label>
                                <Textarea
                                    name="salary"
                                    value={formData.salary ?? ""}
                                    onChange={handleChange}
                                    placeholder="Level 10..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Age Spectrum</Label>
                                <Textarea
                                    name="age"
                                    value={formData.age ?? ""}
                                    onChange={handleChange}
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
                                        name="officialWebsite"
                                        value={formData.officialWebsite ?? ""}
                                        onChange={handleChange}
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
                                        name="notificationUrl"
                                        value={formData.notificationUrl ?? ""}
                                        onChange={handleChange}
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
                            <DatePicker
                                label="Published At"
                                date={formData.publishedAt ?? undefined}
                                onChange={(date) => setFormData({ ...formData, publishedAt: date?.toISOString() || null })}
                                placeholder="Auto-set on publish"
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
