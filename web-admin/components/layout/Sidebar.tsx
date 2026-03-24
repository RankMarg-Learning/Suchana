'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    FileText, 
    Database, 
    ClipboardList, 
    Settings, 
    Bell,
    Layers,
    Menu,
    X,
    ChevronRight,
    Search,
    BookOpen,
    Users,
    UploadCloud,
    CreditCard,
    MessageSquare,
    LogOut,
    Smartphone
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
    { title: 'Dashboard', href: '/', icon: LayoutDashboard },
    { title: 'Exams', href: '/exams', icon: FileText },
    { title: 'Scraper Monitor', href: '/scraper', icon: Database },
    { title: 'Lifecycle', href: '/events', icon: Smartphone },
    { title: 'Review Queue', href: '/review', icon: ClipboardList },
    { title: 'User Profiles', href: '/users', icon: Users },
    { title: 'Service Plans', href: '/plans', icon: CreditCard },
    { title: 'Feedback', href: '/feedback', icon: MessageSquare },
    { title: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="h-screen sticky top-0 bg-white border-r border-gray-200 w-64 flex flex-col z-50 overflow-hidden">
            {/* Logo */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Layers className="text-black w-5 h-5" />
                    </div>
                    <span className="font-black text-xl tracking-tight text-gray-900">
                        <span className="text-primary mr-1">Rank</span>
                        <span className="text-gray-900">Admin</span>
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                                active 
                                    ? "bg-primary text-black font-bold shadow-sm" 
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", active ? "text-black" : "text-gray-400 group-hover:text-gray-900")} />
                            <span className="text-sm">{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="px-4 py-6 border-t border-gray-100">
                <button className="flex items-center justify-center gap-2 w-full py-3 bg-primary rounded-xl text-black font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-95 transition-all">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
