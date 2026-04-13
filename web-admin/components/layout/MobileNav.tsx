'use client';

import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarContent } from './Sidebar';

export function MobileNav() {
    return (
        <header className="lg:hidden sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="text-white w-5 h-5" />
                </div>
                <span className="font-outfit font-bold text-lg tracking-tight text-slate-900">
                    Suchana
                </span>
            </Link>

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-600">
                        <Menu className="w-6 h-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </header>
    );
}
