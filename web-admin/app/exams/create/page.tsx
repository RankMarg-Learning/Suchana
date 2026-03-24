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
    Search,
    ChevronRight,
    MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { EXAM_CATEGORIES, EXAM_LEVELS, EXAM_STATUSES } from '@/constants/enums';
import { examService } from '@/lib/api';

const steps = [
    { title: 'Basic Info', icon: Info, description: 'Enter the exam core details' },
    { title: 'Details', icon: Terminal, description: 'Age criteria, salary, and fees' },
    { title: 'Links', icon: LinkIcon, description: 'Official notification and website' },
    { title: 'Review', icon: CheckCircle2, description: 'One last look before publishing' },
];

export default function CreateExamPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>({
        title: '',
        shortTitle: '',
        slug: '',
        category: 'GOVERNMENT_JOBS',
        examLevel: 'NATIONAL',
        status: 'NOTIFICATION',
        conductingBody: '',
        isPublished: true,
    });

    const handleNext = () => {
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/exams" className="p-3 rounded-2xl bg-muted border border-border/50 hover:bg-card hover:border-border transition-all duration-300">
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-outfit">Create New Exam</h1>
                        <p className="text-muted-foreground mt-1 text-lg">Add a new entry to the Government Exam platform.</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Stepper Sidebar */}
                <div className="lg:w-80 flex flex-col gap-4">
                    {steps.map((step, index) => (
                        <div 
                            key={step.title}
                            className={cn(
                                "premium-card rounded-2xl p-5 flex items-center gap-4 transition-all duration-500 cursor-pointer border-l-4",
                                currentStep === index 
                                    ? "bg-primary/10 border-l-primary shadow-lg shadow-primary/10" 
                                    : currentStep > index 
                                        ? "border-l-emerald-500 opacity-80" 
                                        : "border-l-transparent"
                            )}
                            onClick={() => setCurrentStep(index)}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                currentStep === index 
                                    ? "bg-primary text-white shadow-lg shadow-primary/30 rotate-3" 
                                    : currentStep > index 
                                        ? "bg-emerald-500 text-white" 
                                        : "bg-muted text-muted-foreground"
                            )}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-sm font-bold tracking-tight",
                                    currentStep === index ? "text-primary" : "text-muted-foreground"
                                )}>
                                    Step {index + 1}
                                </span>
                                <span className="font-bold text-lg font-outfit leading-tight">{step.title}</span>
                            </div>
                            {currentStep > index && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-8">
                    <div className="premium-card rounded-3xl p-10 min-h-[500px] flex flex-col">
                        {/* Step content */}
                        {currentStep === 0 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Full Title</label>
                                        <input 
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            type="text" 
                                            placeholder="e.g. SSC Combined Graduate Level 2024" 
                                            className="w-full bg-muted/30 border border-border/50 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-lg font-bold"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Short Title</label>
                                        <input 
                                            name="shortTitle"
                                            value={formData.shortTitle}
                                            onChange={handleChange}
                                            type="text" 
                                            placeholder="e.g. SSC CGL 2024" 
                                            className="w-full bg-muted/30 border border-border/50 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-lg font-bold"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">URL Slug</label>
                                        <input 
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            type="text" 
                                            placeholder="ssc-cgl-2024" 
                                            className="w-full bg-muted/30 border border-border/50 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-mono"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Category</label>
                                        <select 
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full bg-muted/30 border border-border/50 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-lg font-bold appearance-none cursor-pointer"
                                        >
                                            {EXAM_CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Description</label>
                                    <textarea 
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Detailed description of the exam..." 
                                        className="w-full bg-muted/30 border border-border/50 rounded-2xl py-4 px-6 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Total Vacancies</label>
                                        <input 
                                            name="totalVacancies"
                                            value={formData.totalVacancies}
                                            onChange={handleChange}
                                            type="text" 
                                            placeholder="17,727" 
                                            className="w-full bg-muted/30 border border-border/50 rounded-2xl py-3.5 px-5 outline-none focus:border-primary/50 transition-all font-bold"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Salary Range</label>
                                        <input 
                                            name="salary"
                                            value={formData.salary}
                                            onChange={handleChange}
                                            type="text" 
                                            placeholder="₹25,500 - ₹1,51,100" 
                                            className="w-full bg-muted/30 border border-border/50 rounded-2xl py-3.5 px-5 outline-none focus:border-primary/50 transition-all font-bold"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Application Fee</label>
                                        <input 
                                            name="applicationFee"
                                            value={formData.applicationFee}
                                            onChange={handleChange}
                                            type="text" 
                                            placeholder="₹100 for General/OBC" 
                                            className="w-full bg-muted/30 border border-border/50 rounded-2xl py-3.5 px-5 outline-none focus:border-primary/50 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Official Website</label>
                                        <div className="relative group">
                                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <input 
                                                name="officialWebsite"
                                                value={formData.officialWebsite}
                                                onChange={handleChange}
                                                type="url" 
                                                placeholder="https://ssc.gov.in" 
                                                className="w-full bg-muted/30 border border-border/50 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary/50 transition-all text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Notification PDF URL</label>
                                        <div className="relative group">
                                            <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <input 
                                                name="notificationUrl"
                                                value={formData.notificationUrl}
                                                onChange={handleChange}
                                                type="url" 
                                                placeholder="https://ssc.gov.in/docs/notification.pdf" 
                                                className="w-full bg-muted/30 border border-border/50 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary/50 transition-all text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-10 animate-in fade-in zoom-in duration-500">
                                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex items-center gap-8 relative overflow-hidden group">
                                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/30 rotate-6 group-hover:rotate-0 transition-transform duration-500">
                                        <Layers className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold font-outfit">{formData.title || 'Untitled Exam'}</h3>
                                        <p className="text-muted-foreground mt-1 line-clamp-2">{formData.description || 'No description provided.'}</p>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                         <CheckCircle2 className="w-40 h-40" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="bg-muted/10 border border-border/50 rounded-2xl p-5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Category</p>
                                        <p className="font-bold text-lg">{formData.category.replace('_', ' ')}</p>
                                    </div>
                                    <div className="bg-muted/10 border border-border/50 rounded-2xl p-5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Level</p>
                                        <p className="font-bold text-lg">{formData.examLevel}</p>
                                    </div>
                                    <div className="bg-muted/10 border border-border/50 rounded-2xl p-5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Vacancies</p>
                                        <p className="font-bold text-lg">{formData.totalVacancies || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-auto pt-10 flex items-center justify-between border-t border-border mt-10">
                            <button 
                                onClick={handlePrev}
                                disabled={currentStep === 0}
                                className="flex items-center gap-2 px-8 py-3 rounded-2xl border border-border bg-card hover:bg-muted disabled:opacity-0 transition-all font-bold text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Previous Step</span>
                            </button>
                            
                            {currentStep === steps.length - 1 ? (
                                <button className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.05] active:scale-95 transition-all duration-300 font-bold">
                                    <Save className="w-5 h-5" />
                                    <span>Publish Exam Entry</span>
                                </button>
                            ) : (
                                <button 
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all duration-300 font-bold"
                                >
                                    <span>Continue to Next</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
