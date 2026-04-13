'use client';

import React, { useState } from 'react';
import {
    Save,
    ChevronLeft,
    Eye,
    Code,
    RefreshCw,
    ImageIcon,
    Search,
    Bold,
    Italic,
    List,
    Heading1,
    Heading2,
    Heading3,
    MessageCircle,
    Send,
    Calendar,
    ArrowRightCircle,
    ExternalLink as LinkIcon2,
    Check,
    ChevronsUpDown,
    Share2
} from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { SeoPage, Exam, examService } from '@/lib/api';
import { SeoPageCategory } from '../../constants/enums';
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
import { cn } from "@/lib/utils";

import MarkdownRenderer from '../MarkdownRenderer';

import ArticleViralShareDialog from './ArticleViralShareDialog';

interface ArticleEditorProps {
    initialData?: Partial<SeoPage>;
    exams: Exam[];
    isSaving: boolean;
    onSave: (data: Partial<SeoPage>) => void;
    title: string;
}

const ARTICLE_CATEGORIES: { value: SeoPageCategory; label: string }[] = [
    { value: 'NOTIFICATION', label: 'Notification' },
    { value: 'ADMIT_CARD', label: 'Admit Card' },
    { value: 'RESULT', label: 'Result' },
    { value: 'ANSWER_KEY', label: 'Answer Key' },
    { value: 'CUTOFF', label: 'Cut Off' },
    { value: 'SYLLABUS', label: 'Syllabus' },
    { value: 'EXAM_PATTERN', label: 'Exam Pattern' },
    { value: 'ELIGIBILITY', label: 'Eligibility' },
    { value: 'SALARY', label: 'Salary & Job Profile' },
    { value: 'VACANCY', label: 'Vacancy Details' },
    { value: 'APPLICATION_FORM', label: 'Application Form' },
    { value: 'BOOKS', label: 'Best Books' },
    { value: 'PREPARATION_STRATEGY', label: 'Preparation Strategy' },
    { value: 'PREVIOUS_YEAR_PAPER', label: 'Previous Year Paper' },
    { value: 'MOCK_TEST', label: 'Mock Test' },
    { value: 'ANALYSIS', label: 'Exam Analysis' },
    { value: 'COUNSELLING', label: 'Counselling' },
    { value: 'DOCUMENT_VERIFICATION', label: 'Document Verification' },
    { value: 'MERIT_LIST', label: 'Merit List' },
    { value: 'SCORECARD', label: 'Scorecard' },
    { value: 'IMPORTANT_DATES', label: 'Important Dates' },
    { value: 'SELECTION_PROCESS', label: 'Selection Process' },
    { value: 'AGE_LIMIT', label: 'Age Limit' },
    { value: 'APPLICATION_FEE', label: 'Application Fee' },
    { value: 'STATE_EXAMS', label: 'State Exams' },
    { value: 'CENTRAL_EXAMS', label: 'Central Exams' },
    { value: 'CURRENT_AFFAIRS', label: 'Current Affairs' },
    { value: 'GK_STATIC', label: 'Static GK' },
    { value: 'TOOL', label: 'Utility Tool' },
    { value: 'COMPARISON', label: 'Comparison' },
    { value: 'GUIDE', label: 'Complete Guide' },
    { value: 'OTHERS', label: 'Others' },
];


export default function ArticleEditor({ initialData, exams, isSaving, onSave, title }: ArticleEditorProps) {
    // 1. Resolve initial base mappings once efficiently
    const base = initialData || {};
    const extractedExamId = base.examId || (base as any).exam?.id || null;
    const initialMatchingExam = exams.find(e => e.id === extractedExamId) || (base as any)?.exam || null;

    // 2. Hydrate states
    const [formData, setFormData] = useState<Partial<SeoPage>>(() => ({
        slug: base.slug || '',
        title: base.title || '',
        content: base.content || '',
        metaTitle: base.metaTitle || '',
        metaDescription: base.metaDescription || '',
        keywords: base.keywords || [],
        ogImage: base.ogImage || '',
        isPublished: base.isPublished ?? true,
        isTrending: base.isTrending ?? false,
        examId: extractedExamId,
        category: base.category || 'OTHERS' as any
    }));

    const [examUrlInput, setExamUrlInput] = useState(
        initialMatchingExam?.slug ? `https://examsuchana.in/exam/${initialMatchingExam.slug}` : ''
    );
    const [resolvedExam, setResolvedExam] = useState<Exam | null>(initialMatchingExam);

    const [isValidatingExam, setIsValidatingExam] = useState(false);
    const [validationError, setValidationError] = useState('');

    // 3. Sync state when initialData arrives or changes
    React.useEffect(() => {
        if (initialData) {
            const exId = initialData.examId || (initialData as any).exam?.id || null;
            setFormData({
                slug: initialData.slug || '',
                title: initialData.title || '',
                content: initialData.content || '',
                metaTitle: initialData.metaTitle || '',
                metaDescription: initialData.metaDescription || '',
                keywords: initialData.keywords || [],
                ogImage: initialData.ogImage || '',
                isPublished: initialData.isPublished ?? true,
                isTrending: initialData.isTrending ?? false,
                examId: exId,
                category: initialData.category || 'OTHERS' as any
            });
            setIsSlugLocked(!!initialData.slug);

            const matchingExam = exams.find(e => e.id === exId) || (initialData as any).exam || null;

            if (matchingExam) {
                setResolvedExam(matchingExam);
                setExamUrlInput(matchingExam.slug ? `https://examsuchana.in/exam/${matchingExam.slug}` : '');
            }
        }
    }, [initialData?.id, exams]);

    React.useEffect(() => {

        const timeout = setTimeout(async () => {
            if (!examUrlInput) {
                // Ignore clearing if initial setup
                setResolvedExam(null);
                setFormData(prev => ({ ...prev, examId: null as any }));
                setValidationError('');
                return;
            }

            let slugToLookup = examUrlInput.trim();
            try {
                const parsed = new URL(slugToLookup);
                const parts = parsed.pathname.split('/').filter(Boolean);
                slugToLookup = parts[parts.length - 1];
            } catch {
                const parts = slugToLookup.split('/').filter(Boolean);
                slugToLookup = parts[parts.length - 1] || slugToLookup;
            }

            // check local fallbacks first
            let localMatch = exams.find(e => e.slug === slugToLookup || e.id === slugToLookup);
            if (localMatch) {
                setResolvedExam(localMatch);
                setFormData(prev => ({ ...prev, examId: localMatch.id }));
                setValidationError('');
                return;
            }

            // API lookup
            setIsValidatingExam(true);
            try {
                const res = await examService.getExamBySlug(slugToLookup);
                if (res?.success && res.data) {
                    setResolvedExam(res.data);
                    setFormData(prev => ({ ...prev, examId: res.data.id }));
                    setValidationError('');
                } else {
                    const res2 = await examService.getExamById(slugToLookup).catch(() => null);
                    if (res2?.success && res2.data) {
                        setResolvedExam(res2.data);
                        setFormData(prev => ({ ...prev, examId: res2.data.id }));
                        setValidationError('');
                    } else {
                        throw new Error('Not found');
                    }
                }
            } catch (err) {
                setResolvedExam(null);
                setFormData(prev => ({ ...prev, examId: null as any }));
                setValidationError('No matching exam found for this link.');
            } finally {
                setIsValidatingExam(false);
            }
        }, 600);

        return () => clearTimeout(timeout);
    }, [examUrlInput]); // omitting exams from deps so we dont loop

    const [isSlugLocked, setIsSlugLocked] = useState(!!initialData?.slug);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

    const [categorySearch, setCategorySearch] = useState('');
    const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);

    const filteredCategories = ARTICLE_CATEGORIES.filter(cat =>
        cat.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
        cat.value.toLowerCase().includes(categorySearch.toLowerCase())
    );


    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const insertTemplate = (template: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            setFormData(prev => ({ ...prev, content: (prev.content || '') + '\n' + template }));
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = formData.content || '';
        const before = text.substring(0, start);
        const after = text.substring(end);

        const newContent = before + template + after;
        setFormData(prev => ({ ...prev, content: newContent }));

        // Give focus back and set cursor
        setTimeout(() => {
            textarea.focus();
            const newPos = start + template.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 10);
    };

    const handleTitleChange = (newTitle: string) => {
        const updates: Partial<SeoPage> = { title: newTitle };
        if (!isSlugLocked) {
            updates.slug = newTitle
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_]+/g, '-')
                .replace(/-+/g, '-');
        }
        setFormData({ ...formData, ...updates });
    };

    const handleKeywordChange = (val: string) => {
        const keywords = val.split(',').map(k => k.trim()).filter(Boolean);
        setFormData({ ...formData, keywords });
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Simple Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/seo" className="text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        <p className="text-sm text-muted-foreground">Manage article content and SEO metadata</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {formData.slug && (
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                            onClick={() => setIsShareDialogOpen(true)}
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Viral Hub Strategy
                        </Button>
                    )}
                    <Button
                        onClick={() => onSave(formData)}
                        disabled={isSaving || !formData.slug || !formData.title || !formData.content}
                    >
                        {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Article
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="editor" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="editor" className="gap-2">
                        <Code className="w-4 h-4" />
                        Editor
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Article Content</CardTitle>
                                    <CardDescription>Compose your article using Markdown</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            placeholder="Article Title"
                                            value={formData.title}
                                            onChange={(e) => handleTitleChange(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug</Label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">/</span>
                                            <Input
                                                id="slug"
                                                className="rounded-none border-x-0"
                                                placeholder="article-slug"
                                                value={formData.slug}
                                                onChange={(e) => {
                                                    setIsSlugLocked(true);
                                                    setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') });
                                                }}
                                            />
                                            <Button
                                                variant="outline"
                                                className="rounded-l-none border-l-0"
                                                onClick={() => setIsSlugLocked(!isSlugLocked)}
                                                type="button"
                                                title={isSlugLocked ? "Unlock to auto-generate from title" : "Lock to prevent auto-changes"}
                                            >
                                                {isSlugLocked ? <LinkIcon2 className="w-4 h-4 text-muted-foreground" /> : <RefreshCw className="w-4 h-4 text-blue-500" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="content">Content (Markdown)</Label>
                                            <div className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">MODERN EDITOR</div>
                                        </div>

                                        <div className="border rounded-md overflow-hidden bg-muted/50">
                                            {/* Editor Toolbar */}
                                            <TooltipProvider delayDuration={400}>
                                                <div className="flex flex-wrap items-center gap-1 p-1 bg-background border-b shadow-sm">
                                                    <div className="flex items-center gap-0.5 px-1 mr-1">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTemplate('**Bold Text**')}>
                                                                    <Bold className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Bold (**text**)</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTemplate('*Italic Text*')}>
                                                                    <Italic className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Italic (*text*)</TooltipContent>
                                                        </Tooltip>
                                                    </div>

                                                    <Separator orientation="vertical" className="h-6 mx-0.5" />

                                                    <div className="flex items-center gap-0.5 px-1">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTemplate('\n# Heading 1')}>
                                                                    <Heading1 className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>H1</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTemplate('\n## Heading 2')}>
                                                                    <Heading2 className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>H2</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTemplate('\n### Heading 3')}>
                                                                    <Heading3 className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>H3</TooltipContent>
                                                        </Tooltip>
                                                    </div>

                                                    <Separator orientation="vertical" className="h-6 mx-0.5" />

                                                    <div className="flex items-center gap-1 px-2 border-x">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1 px-2 bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800" onClick={() => insertTemplate('\n[READMORE: Label Name | /slug-url]')}>
                                                                    <ArrowRightCircle className="w-3 h-3" />
                                                                    READ MORE
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Insert Related Article Link</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1 px-2 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800" onClick={() => insertTemplate('\n[WHATSAPP: Join WhatsApp Group | https://whatsapp.com/...]')}>
                                                                    <MessageCircle className="w-3 h-3" />
                                                                    WHATSAPP
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Insert WhatsApp Invite</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1 px-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800" onClick={() => insertTemplate('\n[TELEGRAM: Join Telegram Channel | https://t.me/...]')}>
                                                                    <Send className="w-3 h-3" />
                                                                    TELEGRAM
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Insert Telegram Link</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1 px-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:text-purple-800" onClick={() => insertTemplate('\n[TIMELINE: View Full Timeline | /timeline-url]')}>
                                                                    <Calendar className="w-3 h-3" />
                                                                    TIMELINE
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Insert Timeline Link</TooltipContent>
                                                        </Tooltip>
                                                    </div>

                                                    <div className="flex items-center gap-0.5 px-1 ml-auto">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTemplate('\n- List item')}>
                                                                    <List className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Bullet List</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => insertTemplate('[Link Text](https://...)')}>
                                                                    <LinkIcon2 className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>External Link</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </TooltipProvider>

                                            <Textarea
                                                id="content"
                                                ref={textareaRef}
                                                placeholder="Write your content here..."
                                                className="min-h-[600px] w-full bg-transparent px-4 py-3 text-[15px] leading-relaxed shadow-none border-none focus-visible:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 resize-none font-mono"
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>SEO Metadata</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="metaTitle">Meta Title</Label>
                                        <Input
                                            id="metaTitle"
                                            placeholder="Search results title"
                                            value={formData.metaTitle || ''}
                                            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="metaDescription">Meta Description</Label>
                                        <Textarea
                                            id="metaDescription"
                                            className="h-24"
                                            placeholder="Search results description"
                                            value={formData.metaDescription || ''}
                                            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="keywords">Keywords</Label>
                                        <Input
                                            id="keywords"
                                            placeholder="Comma separated"
                                            defaultValue={formData.keywords?.join(', ')}
                                            onChange={(e) => handleKeywordChange(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ogImage">OG Image URL</Label>
                                        <Input
                                            id="ogImage"
                                            placeholder="https://-image-url"
                                            value={formData.ogImage || ''}
                                            onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status & Publishing</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between space-x-2">
                                        <Label htmlFor="published">Published</Label>
                                        <Switch
                                            id="published"
                                            checked={formData.isPublished}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between space-x-2">
                                        <div className="flex flex-col gap-0.5">
                                            <Label htmlFor="trending">Trending</Label>
                                            <span className="text-[10px] text-muted-foreground font-normal">Show in trending hub</span>
                                        </div>
                                        <Switch
                                            id="trending"
                                            checked={formData.isTrending}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isTrending: checked })}
                                            className="data-[state=checked]:bg-amber-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="examUrl">Linked Exam (URL)</Label>
                                        <Input
                                            id="examUrl"
                                            placeholder="https://examsuchana.in/exam/upsc-cse"
                                            value={examUrlInput}
                                            onChange={(e) => setExamUrlInput(e.target.value)}
                                        />
                                        {isValidatingExam ? (
                                            <p className="text-xs text-blue-500 font-medium flex items-center">
                                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                                Validating Exam Link...
                                            </p>
                                        ) : resolvedExam && formData.examId ? (
                                            <p className="text-xs text-emerald-600 font-medium break-all flex items-center">
                                                <Check className="w-3 h-3 mr-1 flex-shrink-0" />
                                                Linked: {resolvedExam.title}
                                            </p>
                                        ) : validationError && examUrlInput ? (
                                            <p className="text-xs text-destructive flex items-center">
                                                {validationError}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground flex items-center">
                                                Paste exam link to bind this article.
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Article Category</Label>
                                        <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={isCategoryPopoverOpen}
                                                    className="w-full justify-between font-normal h-10 px-3 hover:bg-background"
                                                >
                                                    <span className="truncate">
                                                        {formData.category
                                                            ? (ARTICLE_CATEGORIES.find((cat) => cat.value === formData.category)?.label ||
                                                                ARTICLE_CATEGORIES.find((cat) => cat.value.toUpperCase() === String(formData.category).toUpperCase())?.label ||
                                                                formData.category)
                                                            : "Select Category"}
                                                    </span>
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[300px] p-0 shadow-2xl border-border" align="start">
                                                <div className="flex items-center border-b px-3 py-2 bg-muted/30">
                                                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-muted-foreground" />
                                                    <input
                                                        placeholder="Search sections..."
                                                        className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                        value={categorySearch}
                                                        onChange={(e) => setCategorySearch(e.target.value)}
                                                    />
                                                </div>
                                                <ScrollArea className="h-[300px] py-1">
                                                    {filteredCategories.length === 0 ? (
                                                        <p className="p-4 text-xs text-center text-muted-foreground">No category found.</p>
                                                    ) : (
                                                        <div className="px-1">
                                                            {filteredCategories.map((cat) => (
                                                                <button
                                                                    key={cat.value}
                                                                    className={cn(
                                                                        "relative flex w-full cursor-default select-none items-center rounded-sm py-2 px-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors",
                                                                        formData.category === cat.value && "bg-accent/50 font-medium text-primary"
                                                                    )}
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, category: cat.value });
                                                                        setIsCategoryPopoverOpen(false);
                                                                        setCategorySearch('');
                                                                    }}
                                                                >
                                                                    {cat.label}
                                                                    {formData.category === cat.value && (
                                                                        <Check className="ml-auto h-4 w-4 opacity-100 text-primary" />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </ScrollArea>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                </CardContent>
                            </Card>


                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="preview">
                    <Card>
                        <CardContent className="p-8 prose prose-slate max-w-none">
                            <h1>{formData.title || 'Untitled Article'}</h1>
                            <div className="mt-8">
                                <MarkdownRenderer content={formData.content || '*No content to preview*'} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <ArticleViralShareDialog
                isOpen={isShareDialogOpen}
                onOpenChange={setIsShareDialogOpen}
                formData={formData}
                examTitle={resolvedExam?.title}
                examShortTitle={resolvedExam?.shortTitle}
            />
        </div>
    );
}
