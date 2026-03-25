'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Super simple auth layer for Suchana Admin.
 * Key is compared against process.env.NEXT_PUBLIC_ADMIN_KEY
 * Persistence is handled via localStorage.
 */

interface AdminAuthContextType {
    isAuthorized: boolean;
    checkKey: (key: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_KEY_STORAGE_NAME = 'suchana_admin_access_key';
// Fallback for development if env is missing
const TARGET_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [inputKey, setInputKey] = useState('');

    useEffect(() => {
        const storedKey = localStorage.getItem(ADMIN_KEY_STORAGE_NAME);
        if (storedKey === TARGET_KEY) {
            setIsAuthorized(true);
        }
        setLoading(false);
    }, []);

    const handleKeySubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        
        if (inputKey === TARGET_KEY) {
            localStorage.setItem(ADMIN_KEY_STORAGE_NAME, inputKey);
            setIsAuthorized(true);
            toast.success('Access granted');
        } else {
            toast.error('Invalid administrative key');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-pulse flex flex-col items-center">
                    <ShieldCheck className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground font-medium">Verifying credentials...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB] p-4">
                <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden">
                    <div className="h-2 bg-indigo-600" />
                    <CardHeader className="space-y-1 pb-6 pt-8">
                        <div className="mx-auto bg-indigo-50 p-3 rounded-full w-fit mb-2">
                            <Lock className="h-6 w-6 text-indigo-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-center text-slate-900">Suchana Admin</CardTitle>
                        <CardDescription className="text-center text-slate-500">
                            Enter your administrative key to proceed
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8">
                        <form onSubmit={handleKeySubmit} className="space-y-4">
                            <div className="relative group">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="••••••••••••"
                                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 transition-all rounded-lg"
                                    value={inputKey}
                                    onChange={(e) => setInputKey(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <Button 
                                type="submit" 
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                            >
                                Unlock Dashboard
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <AdminAuthContext.Provider value={{ isAuthorized, checkKey: (k) => k === TARGET_KEY }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}
