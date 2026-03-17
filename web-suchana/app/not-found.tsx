"use client";

import Link from "next/link";
import { Home, Search, ArrowRight, AlertCircle, FileQuestion, Bell, Phone } from "lucide-react";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteNav />
      
      <main className="flex-grow flex items-center justify-center pt-20 pb-12 relative overflow-hidden">
        {/* Background Glows */}
        <div style={{ position: 'absolute', top: '15%', left: '15%', width: '400px', height: '400px', backgroundColor: 'rgba(124, 58, 237, 0.1)', borderRadius: '50%', filter: 'blur(120px)', zIndex: -1 }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: '400px', height: '400px', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: '50%', filter: 'blur(120px)', zIndex: -1 }} />
        
        <div className="container px-4 text-center">
          <div className="mx-auto flex items-center justify-center mb-8 relative group" 
               style={{ width: '96px', height: '96px', borderRadius: '24px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', display: 'flex', marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="absolute inset-0 group-hover:opacity-100 transition-opacity" 
                 style={{ backgroundColor: 'rgba(124, 58, 237, 0.2)', borderRadius: '24px', filter: 'blur(20px)', opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }} />
            <FileQuestion size={48} className="text-accent relative z-10 animate-bounce" />
          </div>
          
          <h1 className="font-black mb-4 text-white" style={{ fontSize: 'clamp(80px, 15vw, 150px)', letterSpacing: '-6px', lineHeight: 1, margin: '0 0 16px' }}>
            4<span className="text-accent">0</span>4
          </h1>
          
          <h2 className="font-bold mb-6 text-white" style={{ fontSize: 'clamp(24px, 4vw, 36px)', letterSpacing: '-1px', margin: '0 0 24px' }}>
            Lost in the Exam Lifecycle?
          </h2>
          
          <p className="text-gray-400 mx-auto mb-10 text-lg" style={{ maxWidth: '540px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '40px' }}>
            The notification you&apos;re looking for seems to have expired or never existed. 
            Don&apos;t worry, your exam preparation is still on track.
          </p>
          
          <div className="flex items-center justify-center gap-4" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary btn-lg flex items-center gap-2">
              <Home size={18} />
              Go Back Home
            </Link>
            
            <Link href="/#exams" className="btn btn-ghost btn-lg flex items-center gap-2">
              <Search size={18} />
              Search Exams
            </Link>
          </div>
          
          <div className="mt-16 mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', maxWidth: '960px', marginTop: '64px', marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="group text-left" style={{ padding: '28px', borderRadius: '20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'left', transition: 'all 0.3s' }}>
              <div className="flex items-center justify-center mb-4 transition-transform group-hover:scale-110" 
                   style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.15)', marginBottom: '16px' }}>
                <Bell size={20} className="text-accent" />
              </div>
              <h3 className="font-bold mb-2 text-white" style={{ fontSize: '18px', marginBottom: '8px' }}>Check Notifications</h3>
              <p className="text-sm text-gray-400" style={{ fontSize: '14px' }}>Never miss a deadline by setting up personalized alerts for your target exams.</p>
              <Link href="/#notify" className="mt-4 flex items-center text-xs font-bold text-accent" style={{ display: 'flex', alignItems: 'center', marginTop: '16px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', gap: '6px' }}>
                GO TO ALERTS <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="group text-left" style={{ padding: '28px', borderRadius: '20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'left', transition: 'all 0.3s' }}>
              <div className="flex items-center justify-center mb-4 transition-transform group-hover:scale-110" 
                   style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.15)', marginBottom: '16px' }}>
                <Search size={20} style={{ color: '#60a5fa' }} />
              </div>
              <h3 className="font-bold mb-2 text-white" style={{ fontSize: '18px', marginBottom: '8px' }}>Exam Categories</h3>
              <p className="text-sm text-gray-400" style={{ fontSize: '14px' }}>Browse exams by UPSC, SSC, Banking, Railway and State PSC boards.</p>
              <Link href="/#exams" className="mt-4 flex items-center text-xs font-bold text-accent" style={{ display: 'flex', alignItems: 'center', marginTop: '16px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', gap: '6px' }}>
                BROWSE CATEGORIES <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="group text-left" style={{ padding: '28px', borderRadius: '20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', textAlign: 'left', transition: 'all 0.3s' }}>
              <div className="flex items-center justify-center mb-4 transition-transform group-hover:scale-110" 
                   style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', marginBottom: '16px' }}>
                <Phone size={20} style={{ color: '#34d399' }} />
              </div>
              <h3 className="font-bold mb-2 text-white" style={{ fontSize: '18px', marginBottom: '8px' }}>Need Help?</h3>
              <p className="text-sm text-gray-400" style={{ fontSize: '14px' }}>Contact our support team at help@examsuchana.in for any assistance.</p>
              <Link href="/contact" className="mt-4 flex items-center text-xs font-bold text-accent" style={{ display: 'flex', alignItems: 'center', marginTop: '16px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', gap: '6px' }}>
                CONTACT US <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
