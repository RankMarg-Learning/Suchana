'use client';

import { useState, useEffect } from 'react';
import { 
    Search, 
    Plus, 
    MoreHorizontal,
    ChevronLeft, 
    ChevronRight,
    Loader2,
    Calendar,
    Filter,
    Globe,
    Edit3,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatDate } from '@/lib/utils';
import { examService, Exam } from '@/lib/api';
import { ExamStatus, EXAM_STATUSES } from '@/constants/enums';
import { toast } from 'sonner';
import SummaryStats from '@/components/exams/SummaryStats';

export default function ExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [publishFilter, setPublishFilter] = useState<'ALL' | 'PUBLISHED' | 'UNPUBLISHED'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const data = await examService.getAllExams();
            setExams(data?.data || []);
        } catch (error) {
            console.error('Failed to fetch exams:', error);
            toast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(search.toLowerCase()) || 
                             exam.shortTitle?.toLowerCase().includes(search.toLowerCase()) ||
                             exam.conductingBody?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || exam.status === statusFilter;
        const matchesPublish = publishFilter === 'ALL' ? true : 
                               publishFilter === 'PUBLISHED' ? !!exam.isPublished : 
                               !exam.isPublished;
        return matchesSearch && matchesStatus && matchesPublish;
    });

    const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize));
    const paginatedExams = filteredExams.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, publishFilter]);

    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'ACTIVE':
            case 'REGISTRATION_OPEN':
                return "bg-green-50 text-green-700 border-green-200";
            case 'NOTIFICATION':
                return "bg-blue-50 text-blue-700 border-blue-200";
            case 'RESULT_DECLARED':
                return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case 'ADMIT_CARD_OUT':
                return "bg-purple-50 text-purple-700 border-purple-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            {/* Simple Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Exams</h1>
                    <p className="text-gray-500 text-sm">Manage all your government exam data and timelines</p>
                </div>
                <Link href="/exams/create" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-semibold text-sm shadow-sm">
                    <Plus className="w-4 h-4" />
                    <span>Add Exam</span>
                </Link>
            </div>

            {/* Premium Stats Summary */}
            <SummaryStats exams={exams} loading={loading} />

            {/* Simple Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search exams by title or content..." 
                        className="w-full bg-transparent border-gray-200 border rounded-lg py-2 pl-10 pr-4 outline-none focus:border-primary transition-all text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select 
                        className="bg-transparent border-gray-200 border rounded-lg py-2 px-3 outline-none focus:border-primary text-sm min-w-[140px]"
                        value={publishFilter}
                        onChange={(e) => setPublishFilter(e.target.value as any)}
                    >
                        <option value="ALL">All Visibility</option>
                        <option value="PUBLISHED">Published Only</option>
                        <option value="UNPUBLISHED">Unpublished Exams</option>
                    </select>
                    <select 
                        className="bg-transparent border-gray-200 border rounded-lg py-2 px-3 outline-none focus:border-primary text-sm min-w-[150px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        {EXAM_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
            </div>

            {/* RankAdmin Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#fcfcfc] border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Exam ID</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Title</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Authority</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Live</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={7} className="px-6 py-6">
                                        <div className="h-4 bg-gray-100 rounded w-full" />
                                    </td>
                                </tr>
                            ))
                        ) : paginatedExams.length > 0 ? (
                            paginatedExams.map((exam) => (
                                <tr key={exam.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <span className="text-gray-400 font-mono text-[10px]">{exam.id.substring(0, 6)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/exam/${exam.slug || exam.id}/edit`} className="font-bold text-gray-900 hover:text-primary hover:underline cursor-pointer block max-w-[250px] truncate text-sm">
                                            {exam.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-[9px] font-bold uppercase tracking-wider rounded-md truncate max-w-[120px] block">
                                            {exam.category.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn(
                                            "px-2 py-1 text-[9px] font-bold uppercase tracking-wider border rounded-md inline-block whitespace-nowrap",
                                            getStatusStyle(exam.status)
                                        )}>
                                            {exam.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-gray-600 block max-w-[150px] truncate">{exam.conductingBody || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn(
                                            "px-2 py-1 text-[9px] font-bold uppercase tracking-wider border rounded-md inline-block",
                                            exam.isPublished ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"
                                        )}>
                                            {exam.isPublished ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    try {
                                                        await examService.updateExam(exam.id, { isPublished: !exam.isPublished });
                                                        toast.success(`Exam ${exam.isPublished ? 'unpublished' : 'published'} successfully`);
                                                        fetchExams();
                                                    } catch (error) {
                                                        toast.error('Failed to update published status');
                                                    }
                                                }}
                                                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400 flex items-center justify-center border border-transparent hover:border-gray-200"
                                                title={exam.isPublished ? "Unpublish" : "Publish"}
                                            >
                                                <Globe className={cn("w-4 h-4", exam.isPublished && "text-emerald-500")} />
                                            </button>
                                            <Link 
                                                href={`/exam/${exam.slug || exam.id}/edit`} 
                                                className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-gray-400 flex items-center justify-center border border-transparent hover:border-blue-100"
                                                title="Edit Exam"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Link>
                                            <button 
                                                onClick={async (e) => {
                                                    e.preventDefault();
                                                    if (confirm('Are you sure you want to delete this exam?')) {
                                                        try {
                                                            await examService.deleteExam(exam.id);
                                                            toast.success('Exam deleted');
                                                            fetchExams();
                                                        } catch (error) {
                                                            toast.error('Failed to delete exam');
                                                        }
                                                    }
                                                }}
                                                className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors text-gray-400 flex items-center justify-center border border-transparent hover:border-red-100"
                                                title="Delete Exam"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center">
                                    <p className="text-gray-400 font-medium">No results found for &quot;{search}&quot;</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-[#fcfcfc]">
                    <div className="text-xs text-gray-500 font-medium">
                        Showing {Math.min((currentPage * pageSize) - pageSize + 1, filteredExams.length)} to {Math.min(currentPage * pageSize, filteredExams.length)} of {filteredExams.length} exams
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => {
                                const pageNumber = i + 1;
                                if (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                                    return (
                                        <button 
                                            key={i}
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className={cn(
                                                "min-w-[32px] h-[32px] flex items-center justify-center font-medium text-xs rounded-lg border transition-colors",
                                                currentPage === pageNumber 
                                                    ? "bg-primary text-black font-bold border-primary shadow-sm shadow-primary/20" 
                                                    : "border-transparent text-gray-500 hover:bg-gray-50"
                                            )}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                }
                                if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                    return <span key={i} className="px-1 text-gray-400">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 1}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
