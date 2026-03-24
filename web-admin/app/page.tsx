import { 
    LayoutDashboard, 
    FileText, 
    Database, 
    ClipboardList, 
    TrendingUp, 
    Users, 
    ArrowUpRight, 
    ArrowDownRight, 
    Calendar,
    Activity,
    Plus,
    Filter,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Dashboard() {
    const stats = [
        { title: 'Total Exams', value: '458', icon: FileText, change: '+12%', isPositive: true, color: 'primary' },
        { title: 'Active Jobs', value: '14', icon: Database, change: '-2%', isPositive: false, color: 'accent' },
        { title: 'Pending Review', value: '23', icon: ClipboardList, change: '+5', isPositive: true, color: 'warning' },
        { title: 'Active Users', value: '1.2k', icon: Users, change: '+18%', isPositive: true, color: 'success' },
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-outfit">Welcome back, Admin 👋</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Here's what's happening today in Suchana.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all duration-300 font-medium text-sm">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                    </button>
                    <Link href="/exams/create" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 font-bold text-sm">
                        <Plus className="w-5 h-5" />
                        <span>Create Exam</span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.title} className="premium-card rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                        <div className="flex items-start justify-between">
                            <div className={cn(
                                "p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-500",
                                stat.color === 'accent' && "bg-accent/10 text-accent border-accent/20 group-hover:bg-accent",
                                stat.color === 'warning' && "bg-amber-500/10 text-amber-500 border-amber-500/20 group-hover:bg-amber-500",
                            )}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg",
                                stat.isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                            )}>
                                {stat.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {stat.change}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                            <h3 className="text-3xl font-bold font-outfit mt-1">{stat.value}</h3>
                        </div>
                        {/* Subtle Background Pattern */}
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                             <TrendingUp className="w-24 h-24" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Exams List */}
                <div className="lg:col-span-2 premium-card rounded-3xl overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-bold font-outfit">Recently Created Exams</h3>
                        </div>
                        <Link href="/exams" className="text-sm font-semibold text-primary hover:underline transition-all">View All</Link>
                    </div>
                    <div className="divide-y divide-border/50">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-5 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-bold text-lg text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        EP
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-lg group-hover:text-primary transition-colors">SSC CGL 2024 Tier 1</span>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-xs text-muted-foreground">SSC</span>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span className="text-xs text-muted-foreground italic font-medium">May 12, 2026</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 uppercase tracking-widest">Active</span>
                                    <button className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="premium-card rounded-3xl overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-border flex items-center gap-2">
                        <Activity className="w-5 h-5 text-accent" />
                        <h3 className="text-xl font-bold font-outfit text-accent">Activity Feed</h3>
                    </div>
                    <div className="p-6 space-y-8 overflow-y-auto max-h-[500px] flex-1">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex gap-4 relative">
                                {i < 6 && <div className="absolute top-8 left-4 w-0.5 h-12 bg-border/40" />}
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center relative z-10 shrink-0 border-2 border-card">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                                </div>
                                <div className="flex flex-col gap-1.5 pt-0.5">
                                    <p className="text-sm font-medium leading-relaxed">
                                        <span className="font-bold text-foreground">Rahul Sharma</span> reviewed staged exam <span className="text-primary italic font-semibold cursor-pointer hover:underline">UPSC CSE Prelims...</span>
                                    </p>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-xs">2 minutes ago</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 bg-muted/30 border-t border-border mt-auto">
                        <button className="w-full py-3 rounded-2xl border border-border bg-card text-sm font-bold hover:bg-muted transition-all">Clear History</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
