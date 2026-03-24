'use client';

import { useState, useEffect } from 'react';
import { 
    FileText, 
    Search, 
    Plus, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    Edit3, 
    Trash2, 
    ChevronLeft, 
    ChevronRight,
    ArrowUpDown,
    CheckCircle2,
    Clock,
    Archive
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatDate } from '@/lib/utils';
import { examService, Exam } from '@/lib/api';
import { ExamStatus, EXAM_STATUSES } from '@/constants/enums';

export default function ExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const data = await examService.getAllExams();
                setExams(data?.data || []);
            } catch (error) {
                console.error('Failed to fetch exams:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(search.toLowerCase()) || 
                             exam.shortTitle.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || exam.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status: ExamStatus) => {
        switch(status) {
            case ExamStatus.ACTIVE:
            case ExamStatus.REGISTRATION_OPEN:
                return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case ExamStatus.NOTIFICATION:
                return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case ExamStatus.ARCHIVED:
                return "bg-slate-500/10 text-slate-500 border-slate-500/20";
            case ExamStatus.RESULT_DECLARED:
                return "bg-amber-500/10 text-amber-500 border-amber-500/20";
            default:
                return "bg-muted text-muted-foreground border-border";
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-outfit">Exams Management</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Manage, track and update government exam entries.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/exams/create" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 font-bold text-sm">
                        <Plus className="w-5 h-5" />
                        <span>Create New Exam</span>
                    </Link>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="premium-card rounded-3xl p-6 flex items-center justify-between gap-6 flex-wrap">
                <div className="flex-1 min-w-[300px] relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by title, short title, or slug..." 
                        className="w-full bg-muted/30 border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-all text-sm font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-2xl border border-border/50">
                        {['ALL', ...EXAM_STATUSES].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
                                    statusFilter === status 
                                        ? "bg-card text-foreground shadow-sm border border-border/50" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="premium-card rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="p-6 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-foreground">
                                        Exam Details <ArrowUpDown className="w-3.5 h-3.5" />
                                    </div>
                                </th>
                                <th className="p-6 font-bold text-sm uppercase tracking-wider text-muted-foreground">Category</th>
                                <th className="p-6 font-bold text-sm uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="p-6 font-bold text-sm uppercase tracking-wider text-muted-foreground">Level</th>
                                <th className="p-6 font-bold text-sm uppercase tracking-wider text-muted-foreground">Created At</th>
                                <th className="p-6 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="p-6 bg-muted/10 h-20" />
                                    </tr>
                                ))
                            ) : filteredExams.length > 0 ? (
                                filteredExams.map((exam) => (
                                    <tr key={exam.id} className="hover:bg-muted/30 transition-all duration-300 group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                    {exam.shortTitle?.[0] || 'E'}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-lg group-hover:text-primary transition-colors">{exam.title}</span>
                                                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{exam.shortTitle} • {exam.slug}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-sm font-semibold px-3 py-1.5 rounded-xl bg-muted border border-border text-foreground">
                                                {exam.category.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-widest whitespace-nowrap inline-flex items-center gap-1.5",
                                                getStatusStyle(exam.status)
                                            )}>
                                                {exam.status === ExamStatus.ACTIVE && <CheckCircle2 className="w-3 h-3" />}
                                                {exam.status === ExamStatus.NOTIFICATION && <Clock className="w-3 h-3" />}
                                                {exam.status === ExamStatus.ARCHIVED && <Archive className="w-3 h-3" />}
                                                {exam.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-sm font-bold text-foreground">{exam.examLevel}</span>
                                        </td>
                                        <td className="p-6 font-medium text-muted-foreground text-sm">
                                            {formatDate(exam.createdAt)}
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                                <Link href={`/exams/${exam.id}`} className="p-2.5 rounded-xl bg-muted text-foreground hover:bg-primary hover:text-white transition-all shadow-sm">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button className="p-2.5 rounded-xl bg-muted text-foreground hover:bg-amber-500 hover:text-white transition-all shadow-sm">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2.5 rounded-xl bg-muted text-foreground hover:bg-destructive hover:text-white transition-all shadow-sm">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                <FileText className="w-10 h-10" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold font-outfit">No Exams Found</h4>
                                                <p className="text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
                                            </div>
                                            <button 
                                                onClick={() => { setSearch(''); setStatusFilter('ALL'); }}
                                                className="mt-2 text-primary font-bold hover:underline"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 bg-muted/30 border-t border-border flex items-center justify-between">
                    <p className="text-sm text-muted-foreground font-medium">
                        Showing <span className="text-foreground font-bold">{filteredExams.length}</span> of <span className="text-foreground font-bold">{exams.length}</span> exams
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-50 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1">
                            <button className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">1</button>
                            <button className="w-10 h-10 rounded-xl hover:bg-muted text-muted-foreground font-bold transition-all">2</button>
                            <button className="w-10 h-10 rounded-xl hover:bg-muted text-muted-foreground font-bold transition-all">3</button>
                        </div>
                        <button className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted transition-all">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
