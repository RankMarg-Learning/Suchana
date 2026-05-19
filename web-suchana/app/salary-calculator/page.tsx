import type { Metadata } from "next";
import SalaryCalculatorClient from "./SalaryCalculatorClient";
import { SITE_URL } from "../lib/api";
import { Wrench, Calendar, Coins, BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "7th Pay Commission Salary Calculator 2026 | UPSC, SSC, State PSC In-Hand Pay",
  description:
    "Calculate exact in-hand salary, DA, HRA, and gross pay for UPSC IAS, SSC CGL, RRB NTPC, State PSC & Police jobs under the latest 7th Pay Commission rules.",
  keywords: [
    "7th pay commission salary calculator",
    "SSC CGL salary",
    "UPSC IAS salary",
    "MPSC STI salary",
    "RRB NTPC salary",
    "government job in-hand salary",
    "DA calculation",
    "HRA calculation",
    "Pay Matrix Level 7"
  ],
  openGraph: {
    title: "7th Pay Commission Salary Calculator | Exam Suchana",
    description: "Instantly calculate your gross and in-hand salary for 15+ top government jobs under the 7th Pay Commission.",
    url: `${SITE_URL}/salary-calculator`,
    type: "website",
  }
};

export default function SalaryCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "7th Pay Commission Salary Calculator",
    url: `${SITE_URL}/salary-calculator`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    description: "Calculate exact in-hand salary, DA, HRA, and gross pay for government jobs based on the 7th Pay Commission.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR"
    }
  };

  return (
    <div className="wrap-home" style={{ marginTop: '24px', marginBottom: '60px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="page-grid">
        
        {/* LEFT COLUMN: CALCULATOR & GUIDE */}
        <div className="content-col">
          
          {/* HEADER */}
          <div className="sh">
            <div className="sh-title">
              <span className="cat-tag">CALCULATOR</span> Government Job Salary Calculator
            </div>
            <div className="sh-link" style={{ color: 'var(--accent)' }}>
              7TH CPC RULES
            </div>
          </div>

          {/* DYNAMIC CALCULATOR CLIENT */}
          <SalaryCalculatorClient />

          {/* DETAILED GUIDE SECTION */}
          <div style={{ marginTop: '48px', borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
            <h2 style={{
              fontFamily: 'var(--hd)',
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: '16px'
            }}>
              The Ultimate Guide to 7th Pay Commission Salaries
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.75 }}>
              <p>
                Securing a government job is a monumental achievement in India, offering unparalleled job security, prestige, and a highly structured compensation package. With the implementation of the <strong>7th Central Pay Commission (7th CPC)</strong>, the salary structure transitioned from the old &quot;Pay Band and Grade Pay&quot; system to a much more transparent <strong>Pay Matrix</strong>.
              </p>
              <p>
                Whether you are aiming for a high-ranking gazetted officer role via UPSC or a crucial administrative role through SSC or Railways, understanding your actual &quot;In-Hand&quot; salary versus your &quot;Gross&quot; salary is essential for financial planning. This guide breaks down every component of a government employee&apos;s pay slip.
              </p>

              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', marginTop: '12px' }}>
                <h3 style={{ color: 'var(--ink)', fontWeight: 800, fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', fontFamily: 'var(--hd)' }}>
                  1. Core Components of Gross Salary
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '15px', margin: '0 0 6px 0' }}>Basic Pay</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                      The foundational element of your compensation. The 7th Pay Commission abolished Grade Pay and introduced 18 Pay Levels. For instance, an SSC CGL Inspector enters at <strong>Level 7</strong> with a starting basic pay of <strong>₹44,900</strong>, whereas a UPSC IAS Officer enters at <strong>Level 10</strong> with <strong>₹56,100</strong>. Basic pay typically increases by <strong>3% annually</strong>.
                    </p>
                  </div>

                  <div>
                    <h4 style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '15px', margin: '0 0 6px 0' }}>Dearness Allowance (DA)</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                      Calculated as a direct percentage of the Basic Pay, DA is designed to mitigate the impact of inflation. The Central Government revises the DA twice a year (effective from January 1st and July 1st) based on the All India Consumer Price Index (AICPI).
                    </p>
                  </div>

                  <div>
                    <h4 style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '15px', margin: '0 0 6px 0' }}>House Rent Allowance (HRA)</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                      HRA is determined by the classification of the city you are posted in (X, Y, or Z class cities). Metros like Delhi or Mumbai receive up to 30%, Tier 2 cities receive 20%, and other regions receive 10%.
                    </p>
                  </div>
                </div>
              </div>

              {/* Equation Box */}
              <div style={{ background: 'rgba(124,58,237,0.06)', borderLeft: '4px solid var(--accent)', padding: '16px 20px', borderRadius: '0 4px 4px 0' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--ink)', fontWeight: 700 }}>
                  Gross Salary = Basic Pay + DA + HRA + TA + (DA on TA) + Special Allowances
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px' }}>
                <h3 style={{ color: 'var(--ink)', fontWeight: 800, fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', fontFamily: 'var(--hd)' }}>
                  2. Mandatory Deductions (Gross vs. In-Hand)
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '14.5px' }}>
                  Your Gross Salary is never the exact amount credited to your bank account. The government mandates several deductions to secure your future:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '14px', marginBottom: '4px' }}>National Pension System (NPS)</div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>Exactly 10% of (Basic Pay + DA) is deducted from your salary, while the government contributes 14% to your retirement corpus.</p>
                  </div>
                  <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '14px', marginBottom: '4px' }}>Health Schemes (CGHS)</div>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>A flat monthly deduction (₹250 to ₹1000 depending on Pay Level) for comprehensive medical facilities.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="sidebar-col">
          
          {/* QUICK INFO matrix WIDGET */}
          <div className="sw" style={{ marginTop: 0 }}>
            <div className="sw-head flex items-center gap-1.5">
              <TrendingUp size={16} className="text-purple-400" /> Pay Matrix Scale
            </div>
            <div className="sw-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: 'var(--text-muted)' }}>
                <div>
                  <strong style={{ color: 'var(--ink)' }}>Level 1 to 5:</strong>
                  <div style={{ marginTop: '2px' }}>Auditors, Assistants, MTS & Clerk grades.</div>
                </div>
                <div>
                  <strong style={{ color: 'var(--ink)' }}>Level 6 to 9:</strong>
                  <div style={{ marginTop: '2px' }}>Inspectors, ASOs, and Section Officers.</div>
                </div>
                <div>
                  <strong style={{ color: 'var(--ink)' }}>Level 10+:</strong>
                  <div style={{ marginTop: '2px' }}>Group A Gazetted posts (IAS, IPS, Lieutenant).</div>
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
