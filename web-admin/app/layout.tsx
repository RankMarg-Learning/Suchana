import type { Metadata } from "next";
import { Inter, Outfit, Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Search, Bell, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from 'sonner';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Suchana | Admin Dashboard",
  description: "Government Exam Execution Platform Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={cn(inter.className, outfit.variable, "bg-background")}>
        <Toaster position="top-right" expand={true} richColors />
        <Providers>
          <div className="flex flex-col lg:flex-row min-h-screen w-full">
            <MobileNav />
            <Sidebar className="hidden lg:flex" />
            <main className="flex-1 min-h-screen bg-[#F9FAFB] overflow-y-auto w-full">
              {/* Main Content Container */}
              <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
