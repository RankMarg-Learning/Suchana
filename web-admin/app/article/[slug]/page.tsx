'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { seoService } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
    ChevronLeft, 
    Edit3, 
    ExternalLink, 
    Globe, 
    Calendar, 
    Clock, 
    Tag,
    Share2,
    Layout,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ViewArticlePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const { data: response, isLoading } = useQuery({
        queryKey: ['seo-page-details', slug],
        queryFn: () => seoService.getPageBySlug(slug),
        enabled: !!slug,
    });

    const page = response?.data;

    if (isLoading) {
        return (
            <div className="container mx-auto py-12 max-w-4xl space-y-8 animate-pulse">
                <Skeleton className="h-16 w-3/4 rounded-2xl mx-auto" />
                <Skeleton className="h-64 w-full rounded-3xl" />
                <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
                <div className="p-6 bg-slate-50 rounded-full border border-slate-100">
                    <Globe className="w-12 h-12 text-slate-300" />
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold font-outfit text-slate-900 tracking-tight">Resource Not Found</h1>
                    <p className="text-slate-500 font-medium mt-1">The requested SEO page does not exist in the platform database.</p>
                </div>
                <Button variant="outline" onClick={() => router.push('/seo')} className="rounded-xl px-10 border-slate-200">
                    Browse All Pages
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 container mx-auto py-12 max-w-5xl">
            {/* Context Header */}
            <div className="flex items-center justify-between border-b pb-8 bg-white/50 backdrop-blur rounded-[40px] p-8 border border-slate-50 shadow-xl shadow-slate-100/50">
                <div className="flex items-center gap-6">
                    <Link href="/seo" className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-slate-100 transition-all border border-slate-100 shadow-sm">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5">
                                Public Resource
                            </Badge>
                            <span className="text-[10px] text-slate-400 font-mono font-bold tracking-tight">/{page.slug}</span>
                        </div>
                        <h1 className="text-3xl font-black font-outfit text-slate-900 tracking-tight leading-tight">
                            {page.title}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="lg" 
                        className="rounded-2xl h-14 px-8 border-slate-200 font-bold uppercase tracking-widest text-[11px] shadow-sm hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        onClick={() => window.open(`https://examsuchana.in/${page.slug}`, '_blank')}
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Live Site
                    </Button>
                    <Link href={`/article/${slug}/edit`}>
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 px-12 font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-500/20"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Refine Page
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Article Body */}
                <div className="lg:col-span-8 space-y-8">
                    {page.ogImage && (
                        <div className="rounded-[40px] overflow-hidden border border-slate-100 ring-4 ring-slate-50 shadow-2xl">
                            <img src={page.ogImage} alt={page.title} className="w-full h-auto object-cover" />
                        </div>
                    )}

                    <Card className="rounded-[40px] border-none shadow-none bg-white p-10 md:p-14 lg:p-20 overflow-hidden ring-1 ring-slate-50 border border-slate-50 shadow-2xl shadow-slate-200/50">
                        <article className="prose prose-slate prose-indigo max-w-none">
                            <div className="markdown-body">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {page.content}
                                </ReactMarkdown>
                            </div>
                        </article>
                    </Card>
                </div>

                {/* Performance & Meta Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-[32px] border border-slate-50 bg-white shadow-xl shadow-slate-100/50 overflow-hidden ring-1 ring-slate-50">
                        <div className="bg-indigo-600 p-8 flex flex-col gap-1.5">
                            <h3 className="text-white font-black font-outfit text-xl tracking-tight leading-tight uppercase tracking-wider">SEO Intelligence</h3>
                            <p className="text-white/60 text-[10px] uppercase font-black tracking-[0.2em] font-sans">Performance Metadata</p>
                        </div>
                        <CardContent className="p-8 space-y-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2">
                                        <Share2 className="w-3.5 h-3.5" />
                                        Index Title
                                    </Label>
                                    <p className="text-xs font-bold text-slate-800 leading-tight bg-slate-50/50 p-4 rounded-xl border border-dotted border-slate-200">{page.metaTitle || 'Defaulting to Headline'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Search Description</Label>
                                    <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-dotted border-slate-200 italic">
                                        "{page.metaDescription || 'No description provided.'}"
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 space-y-5">
                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2">
                                        <Tag className="w-3.5 h-3.5" />
                                        Indexed Keywords
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {page.keywords?.length > 0 ? page.keywords.map(k => (
                                            <Badge key={k} variant="outline" className="text-[9px] font-bold text-slate-600 bg-slate-50 rounded-lg py-1 px-3 border-slate-100">{k}</Badge>
                                        )) : <span className="text-xs text-slate-400 font-medium ml-1">None specified</span>}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-2">
                                        <Layout className="w-3.5 h-3.5" />
                                        Bound Entity
                                    </Label>
                                    {page.exam ? (
                                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl group flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">Linked Exam</p>
                                                <p className="text-xs font-bold text-slate-900 line-clamp-1">{(page.exam as any).shortTitle || (page.exam as any).title}</p>
                                            </div>
                                            <button 
                                                onClick={() => router.push(`/exam/${(page.exam as any).slug}/edit`)}
                                                className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : <Badge variant="outline" className="text-[10px] text-slate-400 font-bold border-slate-100 rounded-lg">Standalone Article</Badge>}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(page.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(page.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <style jsx global>{`
                .markdown-body h1 { @apply text-4xl font-black mt-12 mb-6 border-b-2 border-slate-100 pb-2 text-slate-900 font-outfit; }
                .markdown-body h2 { @apply text-3xl font-bold mt-14 mb-6 text-slate-800 font-outfit; }
                .markdown-body h3 { @apply text-2xl font-semibold mt-10 mb-5 text-slate-700 font-outfit; }
                .markdown-body p { @apply text-xl leading-relaxed text-slate-600 mb-8 font-medium; }
                .markdown-body ul { @apply list-disc pl-8 space-y-4 mb-8 bg-slate-50/50 p-8 rounded-3xl border border-slate-100; }
                .markdown-body li { @apply text-slate-600 text-xl font-medium; }
                .markdown-body a { @apply text-indigo-600 font-bold underline hover:text-indigo-700 transition-colors; }
                .markdown-body blockquote { @apply border-l-[12px] border-indigo-600 bg-indigo-50 p-12 my-12 rounded-r-[40px] text-indigo-900 text-2xl font-black italic leading-tight shadow-xl shadow-indigo-500/10; }
                .markdown-body code { @apply bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg font-mono text-sm border border-slate-200 ring-2 ring-slate-50; }
                .markdown-body img { @apply rounded-[40px] my-12 border border-slate-100 ring-4 ring-slate-50 shadow-2xl mx-auto; }
            `}</style>
        </div>
    );
}

const SITE_URL = 'https://examsuchana.in';
