'use client';

import React, { useState } from 'react';
import { 
    Save, 
    ChevronLeft, 
    Eye, 
    Code,
    RefreshCw,
    ImageIcon,
    Link as LinkIcon,
    Globe,
    Tag,
    Share2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { SeoPage, Exam } from '@/lib/api';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';

interface ArticleEditorProps {
    initialData?: Partial<SeoPage>;
    exams: Exam[];
    isSaving: boolean;
    onSave: (data: Partial<SeoPage>) => void;
    title: string;
}

export default function ArticleEditor({ initialData, exams, isSaving, onSave, title }: ArticleEditorProps) {
    const [formData, setFormData] = useState<Partial<SeoPage>>(initialData || {
        slug: '',
        title: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        keywords: [],
        ogImage: '',
        isPublished: true,
        examId: null as any,
        category: ''
    });

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
                <Button 
                    onClick={() => onSave(formData)} 
                    disabled={isSaving || !formData.slug || !formData.title || !formData.content}
                >
                    {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Article
                </Button>
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
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug</Label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">/</span>
                                            <Input 
                                                id="slug"
                                                className="rounded-l-none"
                                                placeholder="article-slug"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="content">Content (Markdown)</Label>
                                        <TextareaAutosize 
                                            id="content"
                                            placeholder="Write your content here..."
                                            className="min-h-[400px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
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
                                    <div className="space-y-2">
                                        <Label htmlFor="exam">Linked Exam</Label>
                                        <Select 
                                            value={formData.examId || "none"} 
                                            onValueChange={(val) => setFormData({ ...formData, examId: val === "none" ? null : val })}
                                        >
                                            <SelectTrigger id="exam">
                                                <SelectValue placeholder="Select Exam" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Standalone Article</SelectItem>
                                                {exams.map(exam => (
                                                    <SelectItem key={exam.id} value={exam.id}>{exam.shortTitle || exam.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

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
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="preview">
                    <Card>
                        <CardContent className="p-8 prose prose-slate max-w-none">
                            <h1>{formData.title || 'Untitled Article'}</h1>
                            <div className="mt-8">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {formData.content || '*No content to preview*'}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
