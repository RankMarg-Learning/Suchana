'use client';

import React, { useState, useEffect } from 'react';
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
    Share2,
    BookOpen,
    LayoutGrid,
    X,
    PanelRightClose,
    PanelRightOpen,
    Maximize2,
    Minimize2,
    ChevronDown,
    ChevronUp
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
import { SeoPage, Exam, examService, Tag, tagService } from '@/lib/api';
import { SeoPageCategory } from '../../constants/enums';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import ExamLink from './ExamLink';
import FAQEditor from './FAQEditor';
import { useQuery } from '@tanstack/react-query';
import MarkdownRenderer from '../MarkdownRenderer';
import ArticleViralShareDialog from './ArticleViralShareDialog';

interface ArticleEditorProps {
    initialData?: Partial<SeoPage>;
    isSaving: boolean;
    onSave: (data: Partial<SeoPage>, tagIds: string[]) => void;
    title: string;
}

const ARTICLE_CATEGORIES: { value: SeoPageCategory; label: string }[] = [
    { value: 'NEWS', label: 'News' },
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


export default function ArticleEditor({ initialData, isSaving, onSave, title }: ArticleEditorProps) {
    const base = initialData || {};
    const extractedExamId = base.examId || (base as any).exam?.id || null;

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
        category: base.category || 'OTHERS' as any,
        faqs: base.faqs || []
    }));

    const { data: exam } = useQuery({
        queryKey: ['exam', formData.examId],
        queryFn: () => examService.getExamById(formData.examId!),
        enabled: !!formData.examId,
    });

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
                category: initialData.category || 'OTHERS' as any,
                faqs: initialData.faqs || []
            });
            setIsSlugLocked(!!initialData.slug);


        }
    }, [initialData?.id]);

    const [isSlugLocked, setIsSlugLocked] = useState(!!initialData?.slug);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    // Controlled local string for the keywords field (avoids uncontrolled-input bug)
    const [keywordsInput, setKeywordsInput] = useState(
        (initialData?.keywords ?? []).join(', ')
    );

    // ── Tags state ──────────────────────────────────────────────────────────
    const [allTags, setAllTags] = useState<Tag[]>(() => {
        // Seed with tags already embedded in initialData so badges render immediately
        return (initialData?.tags ?? []) as Tag[];
    });
    const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(() => {
        // Pre-populate from initialData.tags so selected badges appear without waiting for API
        return new Set((initialData?.tags ?? []).map((t) => t.id));
    });
    const [tagSearch, setTagSearch] = useState('');
    const [tagsLoading, setTagsLoading] = useState(false);
    const [isCreatingTag, setIsCreatingTag] = useState(false);

    // Related articles state
    type RelatedPage = { id: string; slug: string; title: string; category?: string; isPublished?: boolean; metaDescription?: string | null; updatedAt: string };
    const [relatedArticles, setRelatedArticles] = useState<RelatedPage[]>([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    // Stable string key from selectedTagIds so useEffect reliably re-fires on every toggle
    const selectedTagsKey = [...selectedTagIds].sort().join(',');

    useEffect(() => {
        tagService.getAll().then((res) => {
            if (res.success) {
                setAllTags((prev) => {
                    const map = new Map(res.data.map((t) => [t.id, t]));
                    prev.forEach((t) => { if (!map.has(t.id)) map.set(t.id, t); });
                    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
                });
            }
        });
    }, []);

    useEffect(() => {
        const pageId = initialData?.id;
        if (!pageId) return;
        setTagsLoading(true);
        tagService.getTagsByPage(pageId).then((res) => {
            if (res.success) {
                // Merge any newly fetched tag objects into allTags
                setAllTags((prev) => {
                    const map = new Map(prev.map((t) => [t.id, t]));
                    res.data.forEach((t) => map.set(t.id, t));
                    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
                });
                setSelectedTagIds(new Set(res.data.map((t) => t.id)));
            }
        }).finally(() => setTagsLoading(false));
    }, [initialData?.id]);


    const toggleTag = (tagId: string) => {
        setSelectedTagIds((prev) => {
            const next = new Set(prev);
            next.has(tagId) ? next.delete(tagId) : next.add(tagId);
            return next;
        });
    };

    // Inline create tag
    const handleCreateTag = async () => {
        const name = tagSearch.trim();
        if (!name || isCreatingTag) return;
        setIsCreatingTag(true);
        try {
            const res = await tagService.create({ name });
            if (res.success && res.data) {
                setAllTags((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
                setSelectedTagIds((prev) => new Set([...prev, res.data.id]));
                setTagSearch('');
            }
        } catch {
            // ignore
        } finally {
            setIsCreatingTag(false);
        }
    };

    // Fetch related articles whenever selected tags change
    useEffect(() => {
        const tagIds = selectedTagsKey ? selectedTagsKey.split(',') : [];
        if (tagIds.length === 0) { setRelatedArticles([]); return; }
        const t = setTimeout(async () => {
            setRelatedLoading(true);
            try {
                // Fetch related for every selected tag and deduplicate by id
                const results = await Promise.all(
                    tagIds.map((tid) => tagService.getRelatedByTag(tid, initialData?.id, 5).catch(() => null))
                );
                const seen = new Set<string>();
                const merged: RelatedPage[] = [];
                results.forEach((r) => {
                    if (r?.success) r.data.forEach((p) => { if (!seen.has(p.id)) { seen.add(p.id); merged.push(p as RelatedPage); } });
                });
                // Sort by updatedAt desc, cap at 5
                setRelatedArticles(merged.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5));
            } finally {
                setRelatedLoading(false);
            }
        }, 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTagsKey, initialData?.id]);

    const filteredTags = allTags.filter((t) =>
        !tagSearch || t.name.toLowerCase().includes(tagSearch.toLowerCase())
    );
    const noTagMatch = tagSearch.trim().length > 0 && filteredTags.length === 0;

    const [categorySearch, setCategorySearch] = useState('');
    const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
    const toggleSection = (id: string) => setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));

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
                            Viral Hub
                        </Button>
                    )}
                    <Button
                        onClick={() => onSave(formData, Array.from(selectedTagIds))}
                        disabled={isSaving || !formData.slug || !formData.title || !formData.content}
                    >
                        {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Article
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border">
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => toggleSection('meta')}>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <LayoutGrid className="w-4 h-4 text-primary" />
                                        Article Metadata
                                    </CardTitle>
                                    <CardDescription className="text-[11px]">Primary title and SEO friendly URL</CardDescription>
                                </div>
                                {collapsedSections['meta'] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                            </div>
                        </CardHeader>
                        {!collapsedSections['meta'] && (
                            <CardContent className="space-y-4 pt-0">
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
                                <Tabs defaultValue="write" className="space-y-4">
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                        <Label htmlFor="content" className="text-sm font-semibold">Content (Markdown)</Label>
                                        <TabsList className="h-8 p-1 bg-muted/50 border shadow-none">
                                            <TabsTrigger value="write" className="h-6 text-[11px] gap-1.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                                <Code className="w-3.5 h-3.5" />
                                                Write
                                            </TabsTrigger>
                                            <TabsTrigger value="preview" className="h-6 text-[11px] gap-1.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                                <Eye className="w-3.5 h-3.5" />
                                                Preview
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="write" className="mt-0 focus-visible:outline-none ring-0">
                                        <div className="border rounded-md overflow-hidden bg-muted/50 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-shadow">
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
                                                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1 px-2 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800" onClick={() => insertTemplate('\n[WHATSAPP: Join WhatsApp Group for Updates | https://whatsapp.com/channel/0029VbCFF9GGehEEUajvbk43]')}>
                                                                    <MessageCircle className="w-3 h-3" />
                                                                    WHATSAPP
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Insert WhatsApp Invite</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1 px-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800" onClick={() => insertTemplate('\n[TELEGRAM: Join Telegram Channel for Updates | https://t.me/examsuchana]')}>
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

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1 px-2 bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800" onClick={() => insertTemplate('\n[BOOK: Book Title | https://image-url.jpg | https://buy-url.com]')}>
                                                                    <BookOpen className="w-3 h-3" />
                                                                    BOOKS
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Insert Topper Recommended Book</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold gap-1 px-2 bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-800" onClick={() => insertTemplate('\n[BOOKGRID: Book 1 | Img1 | Link1 ; Book 2 | Img2 | Link2 ; Book 3 | Img3 | Link3]')}>
                                                                    <LayoutGrid className="w-3 h-3" />
                                                                    MINI GRID
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Insert Compact 3-Book Grid</TooltipContent>
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
                                                className="min-h-[700px] w-full bg-transparent px-4 py-3 text-[15px] leading-relaxed shadow-none border-none focus-visible:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 resize-none font-mono transition-colors duration-200"
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.add('bg-primary/5');
                                                }}
                                                onDragLeave={(e) => {
                                                    e.currentTarget.classList.remove('bg-primary/5');
                                                }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.remove('bg-primary/5');
                                                    const data = e.dataTransfer.getData('article');
                                                    if (data) {
                                                        try {
                                                            const { title, slug } = JSON.parse(data);
                                                            insertTemplate(`\n[READMORE: ${title} | /${slug}]`);
                                                        } catch (err) { /* ignore */ }
                                                    }
                                                }}
                                            />
                                        </div>
                                        
                                        <div className="mt-8 border-t pt-8">
                                            <FAQEditor
                                                faqs={formData.faqs || []}
                                                onChange={(faqs) => setFormData(prev => ({ ...prev, faqs }))}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="preview" className="mt-0 focus-visible:outline-none ring-0">
                                        <div className="border rounded-md min-h-[700px] bg-background p-8 prose prose-slate max-w-none shadow-inner overflow-y-auto">
                                            <h2 className="border-b pb-4 mb-8 text-2xl font-bold">{formData.title || 'Untitled Preview'}</h2>
                                            <MarkdownRenderer content={formData.content || '*No content to preview*'} />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="overflow-hidden shadow-sm ring-1 ring-border border-none">
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => toggleSection('seo')}>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Search className="w-4 h-4 text-primary" />
                                    SEO Metadata
                                </CardTitle>
                                {collapsedSections['seo'] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                            </div>
                        </CardHeader>
                        {!collapsedSections['seo'] && (
                            <CardContent className="space-y-4 pt-0">
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
                                        value={keywordsInput}
                                        onChange={(e) => {
                                            setKeywordsInput(e.target.value);
                                            handleKeywordChange(e.target.value);
                                        }}
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
                        )}
                    </Card>

                    <Card className="overflow-hidden shadow-sm ring-1 ring-border border-none">
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => toggleSection('status')}>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-emerald-500" />
                                    Status & Publishing
                                </CardTitle>
                                {collapsedSections['status'] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                            </div>
                        </CardHeader>
                        {!collapsedSections['status'] && (
                            <CardContent className="space-y-4 pt-0">
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
                                <ExamLink
                                    initialExamId={formData.examId}
                                    initialSlug={exam?.data?.slug}
                                    onExamResolved={(id) => setFormData(prev => ({ ...prev, examId: id as any }))}
                                />
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
                        )}
                    </Card>


                    <Card className="overflow-hidden shadow-sm ring-1 ring-border border-none">
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-2" onClick={() => toggleSection('tags')}>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    <Search className="w-4 h-4 text-indigo-500" />
                                    Tags
                                    {selectedTagIds.size > 0 && (
                                        <span className="ml-auto text-[10px] font-normal bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                            {selectedTagIds.size}
                                        </span>
                                    )}
                                </CardTitle>
                                {collapsedSections['tags'] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                            </div>
                        </CardHeader>
                        {!collapsedSections['tags'] && (
                            <CardContent className="space-y-4 pt-0">
                                <div className="space-y-2">
                                    <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <div className="relative cursor-pointer group">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                <div className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1 text-sm shadow-sm transition-colors items-center text-muted-foreground hover:border-primary/50">
                                                    Search or create tags...
                                                </div>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0" align="start">
                                            <div className="flex items-center border-b px-3 py-2 bg-muted/30">
                                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                <input
                                                    placeholder="Find a tag..."
                                                    className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={tagSearch}
                                                    onChange={(e) => setTagSearch(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && noTagMatch) {
                                                            e.preventDefault();
                                                            handleCreateTag();
                                                        }
                                                    }}
                                                    autoFocus
                                                />
                                                {tagSearch && (
                                                    <button onClick={() => setTagSearch('')} className="p-1 hover:bg-muted rounded text-muted-foreground">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <ScrollArea className="h-[250px]">
                                                {tagsLoading ? (
                                                    <div className="p-4 text-center space-y-2">
                                                        <RefreshCw className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                                                        <p className="text-xs text-muted-foreground">Loading tags...</p>
                                                    </div>
                                                ) : noTagMatch ? (
                                                    <div className="p-3">
                                                        <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3 space-y-2">
                                                            <p className="text-[11px] text-muted-foreground">
                                                                No tag found for <span className="font-semibold text-foreground">"{tagSearch}"</span>.
                                                            </p>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                className="h-7 text-[11px] gap-1.5 w-full bg-primary hover:bg-primary/90"
                                                                disabled={isCreatingTag}
                                                                onClick={handleCreateTag}
                                                            >
                                                                {isCreatingTag ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                                Create "{tagSearch}"
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-1">
                                                        {filteredTags.map((tag) => {
                                                            const selected = selectedTagIds.has(tag.id);
                                                            return (
                                                                <button
                                                                    key={tag.id}
                                                                    type="button"
                                                                    onClick={() => toggleTag(tag.id)}
                                                                    className={cn(
                                                                        "relative flex w-full cursor-default select-none items-center rounded-sm py-2 px-3 text-xs outline-none hover:bg-accent hover:text-accent-foreground transition-colors",
                                                                        selected && "bg-accent/50 font-medium text-primary"
                                                                    )}
                                                                >
                                                                    <span
                                                                        className="flex-shrink-0 w-2.5 h-2.5 rounded-full mr-2 ring-1 ring-border"
                                                                        style={{ background: tag.color || '#94a3b8' }}
                                                                    />
                                                                    <span className="flex-1 truncate">{tag.name}</span>
                                                                    {selected && <Check className="ml-auto h-3 h-3 text-primary" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </ScrollArea>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Selected Badges Grid */}
                                {selectedTagIds.size > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {allTags
                                            .filter(t => selectedTagIds.has(t.id))
                                            .map(tag => (
                                                <div
                                                    key={tag.id}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-border bg-background shadow-sm hover:border-primary/50 transition-colors group cursor-default"
                                                >
                                                    <span
                                                        className="w-1.5 h-1.5 rounded-full"
                                                        style={{ background: tag.color || '#94a3b8' }}
                                                    />
                                                    {tag.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleTag(tag.id)}
                                                        className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}

                                {selectedTagIds.size === 0 && (
                                    <p className="text-[11px] text-muted-foreground text-center py-2 italic">
                                        No tags selected yet.
                                    </p>
                                )}
                            </CardContent>
                        )}
                    </Card>

                    <Card className="overflow-hidden shadow-sm ring-1 ring-border border-none">
                        <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors pb-2" onClick={() => toggleSection('related')}>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                    <BookOpen className="w-4 h-4 text-amber-500" />
                                    Related Articles
                                    <span className="ml-auto text-[10px] font-normal text-muted-foreground">via shared tags</span>
                                </CardTitle>
                                {collapsedSections['related'] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
                            </div>
                        </CardHeader>
                        {!collapsedSections['related'] && (
                            <CardContent className="pt-0">
                                {selectedTagIds.size === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-4">
                                        Select tags above to discover related articles.
                                    </p>
                                ) : relatedLoading ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-10 rounded-md bg-muted/50 animate-pulse" />
                                        ))}
                                    </div>
                                ) : relatedArticles.length === 0 ? (
                                    <div className="text-center py-4 space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            No other articles share these tags yet.
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/70">
                                            Save this article first, then tag others to see connections here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {relatedArticles.map((page) => (
                                            <a
                                                key={page.id}
                                                href={`/seo/${page.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                draggable="true"
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('article', JSON.stringify({ title: page.title, slug: page.slug }));
                                                    e.dataTransfer.effectAllowed = 'copy';
                                                }}
                                                className="group flex flex-col rounded-md px-2.5 py-2 hover:bg-accent/40 transition-colors border border-transparent hover:border-border cursor-grab active:cursor-grabbing"
                                            >
                                                <div className="flex items-start gap-1.5">
                                                    <span className="text-xs font-medium leading-snug group-hover:text-primary transition-colors line-clamp-1 flex-1">
                                                        {page.title}
                                                    </span>
                                                    {page.isPublished === false && (
                                                        <span className="flex-shrink-0 text-[9px] font-semibold bg-amber-100 text-amber-700 px-1 py-0.5 rounded mt-0.5">
                                                            DRAFT
                                                        </span>
                                                    )}
                                                </div>
                                                {page.category && (
                                                    <span className="text-[10px] text-muted-foreground mt-0.5">
                                                        {ARTICLE_CATEGORIES.find(c => c.value === page.category)?.label ?? page.category}
                                                    </span>
                                                )}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        )}
                    </Card>
                </div>
            </div>

            <ArticleViralShareDialog
                isOpen={isShareDialogOpen}
                onOpenChange={setIsShareDialogOpen}
                formData={formData}
                examTitle={exam?.data?.title}
                examShortTitle={exam?.data?.shortTitle}
            />
        </div>
    );
}
