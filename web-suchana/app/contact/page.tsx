import { Metadata } from "next";
import { Mail, MapPin, Clock, MessageSquare, ShieldCheck, Send, MessageCircle, ExternalLink, Smartphone, Wrench, Calendar, Coins, BookOpen } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us — Exam Suchana",
  description: "Get in touch with the Exam Suchana team for support, feature requests, or collaboration inquiries.",
};

export default function ContactPage() {
  return (
    <div className="wrap-home" style={{ marginTop: '24px', marginBottom: '60px' }}>
      <div className="page-grid">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="content-col">
          
          {/* HEADER */}
          <div className="sh">
            <div className="sh-title">
              <span className="cat-tag">SUPPORT</span> Contact &amp; Support Center
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Email Channel */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(124,58,237,0.06)', color: 'var(--accent)' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Official Support Email</div>
                  <a href="mailto:help@examsuchana.in" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ink)', textDecoration: 'none', display: 'block', marginTop: '2px' }}>
                    help@examsuchana.in
                  </a>
                </div>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
                Direct support for exam tracking, notification corrections, and partnership proposals. We review all messages within 24 hours.
              </p>
            </div>

            {/* Social & Community */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(16,185,129,0.06)', color: '#10b981' }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Communities</div>
                  <h2 style={{ fontFamily: 'var(--hd)', fontSize: '18px', fontWeight: 800, color: 'var(--ink)', margin: '2px 0 0 0' }}>Join Candidate Channels</h2>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <a href="https://t.me/examsuchana" target="_blank" rel="noopener noreferrer" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 16px', 
                    background: '#f9fafb',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: '#0088cc',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '13.5px'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={16} /> Telegram
                  </span>
                  <ExternalLink size={12} opacity={0.6} />
                </a>
                
                <a href="https://wa.me/examsuchana" target="_blank" rel="noopener noreferrer" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '12px 16px', 
                    background: '#f9fafb',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: '#128c7e',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '13.5px'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageCircle size={16} /> WhatsApp
                  </span>
                  <ExternalLink size={12} opacity={0.6} />
                </a>
              </div>
              
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
                Fastest exam notifications. Join thousands of aspirants receiving real-time alerts.
              </p>
            </div>

            {/* Secondary Support Context */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} className="text-emerald-500" /> Data Integrity
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  Spotted an error in an exam timeline? Email us the official gazette link. Our content team verifies and updates within 4 operational hours.
                </p>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smartphone size={16} className="text-purple-500" /> Mobile App Support
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  Experiencing issues with notification delivery or account synchronization? Reach out with your device model details for priority debugging.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="sidebar-col">
          
          {/* OPERATIONAL INFORMATION */}
          <div className="sw" style={{ marginTop: 0 }}>
            <div className="sw-head flex items-center gap-1.5">
              <Clock size={16} className="text-amber-500" /> Operations
            </div>
            <div className="sw-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>Mon – Sat, 9:00 AM – 6:00 PM</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Indian Standard Time (IST)</div>
                </div>
                <div style={{ height: '1px', background: 'var(--border)' }} />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <MapPin size={14} color="var(--accent)" /> Pan-India Intelligence
                </div>
              </div>
            </div>
          </div>

          {/* ASPIRANT TOOLSET */}
          <div className="sw">
            <div className="sw-head flex items-center gap-1.5">
              <Wrench size={16} className="text-purple-400" /> Aspirant Toolset
            </div>
            <div className="sw-body">
              <div className="tool-grid" style={{ gridTemplateColumns: '1fr' }}>
                <Link href="/age-calculator" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} />
                  </span>
                  Age Calculator
                </Link>
                <Link href="/salary-calculator" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={18} />
                  </span>
                  Salary Calculator
                </Link>
                <Link href="/syllabus" className="tool-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}>
                  <span className="tool-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={18} />
                  </span>
                  Syllabus Maps
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
