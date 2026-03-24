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
    Search
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
    { title: 'Dashboard', href: '/', icon: LayoutDashboard },
    { title: 'Exams', href: '/exams', icon: FileText },
    { title: 'Lifecycle Events', href: '/events', icon: Layers },
    { title: 'Scraper Jobs', href: '/scraper', icon: Database },
    { title: 'Review Queue', href: '/review', icon: ClipboardList },
    { title: 'Notifications', href: '/notifications', icon: Bell },
    { title: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside 
            className={cn(
                "h-screen sticky top-0 bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col z-50",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="p-6 flex items-center justify-between">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Layers className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Suchana</span>
                    </div>
                )}
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                    {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group relative",
                                active 
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", active ? "text-white" : "text-muted-foreground")} />
                            {!collapsed && (
                                <span className="font-medium">{item.title}</span>
                            )}
                            {!collapsed && active && (
                                <ChevronRight className="w-4 h-4 ml-auto text-primary-foreground/70" />
                            )}
                            {collapsed && active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                {!collapsed ? (
                    <div className="bg-muted/50 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            A
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">Admin User</span>
                            <span className="text-xs text-muted-foreground truncate w-32">admin@suchana.org</span>
                        </div>
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mx-auto">
                        A
                    </div>
                )}
            </div>
        </aside>
    );
}
