import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Search, Bell, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Suchana | Admin Dashboard",
  description: "Government Exam Execution Platform Admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.variable, outfit.variable, "flex min-h-screen bg-background")}>
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Topbar */}
          <header className="h-20 border-b border-border bg-card px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
            <div className="flex items-center gap-4 bg-muted/30 px-4 py-2 rounded-xl border border-border/50 group focus-within:border-primary/50 transition-all duration-300 w-96 max-md:hidden">
              <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search exams, users, settings..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
              />
              <kbd className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-border bg-card text-muted-foreground uppercase tracking-widest pointer-events-none">
                ⌘K
              </kbd>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 max-lg:hidden">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium text-accent">Server Time: 12:45 PM IST</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button className={cn(
                  "p-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all duration-300 relative group",
                )}>
                  <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-destructive border-2 border-card" />
                </button>
                <button className="p-1 rounded-xl border border-border bg-card hover:bg-muted transition-all duration-300 flex items-center gap-2 pr-4 group">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/20">
                    AU
                  </div>
                  <div className="flex flex-col items-start max-md:hidden">
                    <span className="text-xs font-semibold group-hover:text-primary transition-colors">Admin User</span>
                    <span className="text-[10px] text-muted-foreground">Admin</span>
                  </div>
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <section className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
            <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                {children}
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
