'use client';

import { useState } from 'react';
import { 
    Bell, 
    Send, 
    Users, 
    Search, 
    Filter, 
    Calendar, 
    MessageCircle, 
    ChevronRight,
    CheckCircle2,
    Clock,
    Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [targetAudience, setTargetAudience] = useState('BOOKMARKED');

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-outfit text-accent">Push Notifications</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Send real-time updates directly to candidate's mobile devices.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                        <Smartphone className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Notification Form */}
                <div className="premium-card rounded-3xl p-10 flex flex-col gap-8 shadow-2xl shadow-accent/5">
                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Notification Title</label>
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                type="text" 
                                placeholder="e.g. Admit Card Out: SSC CGL 2024" 
                                className="w-full bg-muted/30 border border-border/50 rounded-2xl py-4 px-6 outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all text-lg font-bold"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Message Body</label>
                            <textarea 
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={5}
                                placeholder="Details about the update..." 
                                className="w-full bg-muted/30 border border-border/50 rounded-2xl py-4 px-6 outline-none focus:border-accent/50 transition-all text-sm font-medium resize-none leading-relaxed"
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">Target Audience</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setTargetAudience('BOOKMARKED')}
                                    className={cn(
                                        "flex items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300 font-bold text-sm",
                                        targetAudience === 'BOOKMARKED' ? "bg-accent/10 border-accent/50 text-accent shadow-lg shadow-accent/10 scale-[1.02]" : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    <Bell className="w-4 h-4" />
                                    <span>Bookmarked Users</span>
                                </button>
                                <button 
                                    onClick={() => setTargetAudience('INTERESTED')}
                                    className={cn(
                                        "flex items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300 font-bold text-sm",
                                        targetAudience === 'INTERESTED' ? "bg-accent/10 border-accent/50 text-accent shadow-lg shadow-accent/10 scale-[1.02]" : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    <Users className="w-4 h-4" />
                                    <span>Interested Users</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <button className="mt-4 flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-accent text-accent-foreground shadow-xl shadow-accent/20 hover:scale-[1.05] active:scale-95 transition-all duration-300 font-bold text-lg">
                        <Send className="w-5 h-5" />
                        <span>Dispatch Notification</span>
                    </button>
                    <p className="text-center text-xs text-muted-foreground italic">Estimated reach: 1,452 users</p>
                </div>

                {/* Mobile Preview */}
                <div className="flex flex-col items-center justify-center p-10 bg-muted/20 rounded-3xl border border-border border-dashed relative group">
                    <div className="absolute top-10 left-10 opacity-20 group-hover:opacity-40 transition-opacity duration-1000 rotate-[-12deg]">
                        <MessageCircle className="w-40 h-40" />
                    </div>
                    
                    <div className="w-[300px] h-[600px] bg-black border-[6px] border-[#333] rounded-[48px] shadow-2xl relative overflow-hidden transition-transform duration-700 hover:rotate-2">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" />
                        
                        {/* Status Bar */}
                        <div className="absolute top-0 left-0 right-0 h-10 px-6 flex items-center justify-between text-white text-[10px] font-bold z-10 pt-1">
                            <span>12:45</span>
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full border border-white/40" />
                                <div className="w-4 h-3 rounded border border-white/40" />
                            </div>
                        </div>

                        {/* Lock Screen/Home Screen Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-accent/40" />

                        {/* Notification Bubble */}
                        <div className="absolute top-24 left-4 right-4 animate-in fade-in slide-in-from-top-12 duration-1000 delay-500">
                             <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 shadow-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center text-white text-[10px] font-bold">S</div>
                                        <span className="text-white text-[10px] font-bold uppercase tracking-widest opacity-80">Suchana</span>
                                    </div>
                                    <span className="text-white text-[10px] opacity-60 font-medium">now</span>
                                </div>
                                <h4 className="text-white text-sm font-bold truncate">{title || 'Notification Title'}</h4>
                                <p className="text-white/80 text-xs mt-1 leading-relaxed line-clamp-3">{body || 'Type your message in the form to see a preview of how it will appear on mobile devices.'}</p>
                             </div>
                        </div>

                        {/* Clock on lockscreen */}
                        <div className="absolute top-48 left-0 right-0 text-center animate-in fade-in duration-1000 delay-200">
                             <div className="text-white/90 text-6xl font-outfit font-light tracking-tight mt-12">12:45</div>
                             <div className="text-white/70 text-sm font-bold tracking-widest uppercase mt-2">Monday, May 12</div>
                        </div>

                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-10">
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white"><Bell className="w-5 h-5" /></div>
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white"><Smartphone className="w-5 h-5" /></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
