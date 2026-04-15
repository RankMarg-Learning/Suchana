'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Database,
    ClipboardList,
    Settings,
    Users,
    CreditCard,
    MessageSquare,
    LogOut,
    Smartphone,
    ShieldCheck,
    Globe,
    Tag,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
    { title: 'Dashboard', href: '/', icon: LayoutDashboard },
    { title: 'Exams', href: '/exams', icon: FileText },
    { title: 'Timeline', href: '/events', icon: Smartphone },
    { title: 'Scrapers', href: '/scraper', icon: Database },
    { title: 'Reviews', href: '/review', icon: ClipboardList },
    { title: 'Articles & SEO', href: '/seo', icon: Globe },
    { title: 'Tags', href: '/tags', icon: Tag },
    { title: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    const content = (
        <>
            {/* Minimal Logo */}
            <div className="p-8 pb-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShieldCheck className="text-white w-5 h-5" />
                    </div>
                    <span className="font-outfit font-bold text-lg tracking-tight text-slate-900">
                        Suchana Admin
                    </span>
                </Link>
            </div>

            {/* Simple Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                    const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 relative",
                                active
                                    ? "text-indigo-600 bg-indigo-50/50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            <span className={cn(
                                "text-sm font-medium",
                                active ? "text-indigo-700" : "text-slate-600"
                            )}>{item.title}</span>

                            {active && (
                                <motion.div
                                    layoutId="nav-active"
                                    className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Minimal Footer */}
            <div className="p-4 border-t border-slate-50">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all group">
                    <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
                    <span className="text-sm font-semibold">Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <aside className={cn("w-64 h-screen sticky top-0 bg-white border-r border-slate-100 flex flex-col z-50", className)}>
            {content}
        </aside>
    );
}

export function SidebarContent() {
    const pathname = usePathname();
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Minimal Logo */}
            <div className="p-8 pb-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShieldCheck className="text-white w-5 h-5" />
                    </div>
                    <span className="font-outfit font-bold text-lg tracking-tight text-slate-900">
                        Suchana Admin
                    </span>
                </Link>
            </div>

            {/* Simple Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => {
                    const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 relative",
                                active
                                    ? "text-indigo-600 bg-indigo-50/50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            <span className={cn(
                                "text-sm font-medium",
                                active ? "text-indigo-700" : "text-slate-600"
                            )}>{item.title}</span>

                            {active && (
                                <motion.div
                                    layoutId="nav-active-mobile"
                                    className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Minimal Footer */}
            <div className="p-4 border-t border-slate-50">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all group">
                    <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
                    <span className="text-sm font-semibold">Logout</span>
                </button>
            </div>
        </div>
    );
}
