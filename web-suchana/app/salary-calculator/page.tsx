import type { Metadata } from "next";
import SalaryCalculatorClient from "./SalaryCalculatorClient";
import { SITE_URL } from "../lib/api";

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
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* ─── Hero ─── */}
      <section className="section" style={{ paddingTop: '16px', paddingBottom: '40px', position: 'relative' }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(var(--accent-rgb), 0.15) 0%, transparent 70%)",
            zIndex: 0
          }}
        />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div className="hero-badge mx-auto">
            <span className="hero-badge-dot" />
            7th Pay Commission
          </div>
          <h1 className="section-title mx-auto" style={{ maxWidth: '800px', fontSize: 'clamp(32px, 8vw, 56px)', lineHeight: 1.2 }}>
            Government Job <span className="text-accent">Salary Calculator</span>
          </h1>
          <p className="section-desc mx-auto" style={{ fontSize: '18px', maxWidth: '700px' }}>
            Calculate exact in-hand salary, Dearness Allowance (DA), House Rent Allowance (HRA), and gross pay for positions like MPSC STI, RRB Clerk, SSC CGL, and more.
          </p>
        </div>
      </section>

      {/* ─── Calculator ─── */}
      <section className="section" style={{ paddingTop: '0' }}>
        <div className="container">
          <SalaryCalculatorClient />
        </div>
      </section>

      {/* ─── SEO Content & Detailed Guide ─── */}
      <section className="section bg-secondary" style={{ paddingBottom: '80px' }}>
        <div className="container" style={{ maxWidth: '900px' }}>

          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title" style={{ fontSize: '32px' }}>
              The Ultimate Guide to 7th Pay Commission Salaries
            </h2>
            <p className="section-desc" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '16px' }}>
              Decoding the complexities of government job salaries, allowances, and deductions in India. Learn exactly how your in-hand salary is calculated for UPSC, SSC, Railways, Banking, and State PSCs.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.8 }}>

            {/* Introduction */}
            <div className="article-block">
              <p>
                Securing a government job is a monumental achievement in India, offering unparalleled job security, prestige, and a highly structured compensation package. With the implementation of the <strong>7th Central Pay Commission (7th CPC)</strong>, the salary structure transitioned from the old "Pay Band and Grade Pay" system to a much more transparent <strong>Pay Matrix</strong>.
              </p>
              <p style={{ marginTop: '16px' }}>
                Whether you are aiming for a high-ranking gazetted officer role via UPSC or a crucial administrative role through SSC or Railways, understanding your actual "In-Hand" salary versus your "Gross" salary is essential for financial planning. This guide breaks down every component of a government employee's pay slip.
              </p>
            </div>

            {/* Components of Salary */}
            <div className="feature-card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(18px, 5vw, 22px)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                1. Core Components of Gross Salary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h4 style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Basic Pay</h4>
                  <p style={{ margin: 0 }}>
                    The foundational element of your compensation. The 7th Pay Commission abolished Grade Pay and introduced 18 Pay Levels. For instance, an SSC CGL Inspector enters at <strong>Level 7</strong> with a starting basic pay of <strong>₹44,900</strong>, whereas a UPSC IAS Officer enters at <strong>Level 10</strong> with <strong>₹56,100</strong>. Basic pay typically increases by <strong>3% annually</strong>.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Dearness Allowance (DA)</h4>
                  <p style={{ margin: 0 }}>
                    Calculated as a direct percentage of the Basic Pay, DA is designed to mitigate the impact of inflation. The Central Government revises the DA twice a year (effective from January 1st and July 1st) based on the All India Consumer Price Index (AICPI). Historically, when DA crosses 50%, other allowances (like HRA) are automatically revised upwards.
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>House Rent Allowance (HRA)</h4>
                  <p style={{ margin: 0 }}>
                    HRA is determined by the classification of the city you are posted in. Cities are classified as <strong>X, Y, or Z</strong> based on population density and cost of living.
                  </p>
                  <ul style={{ marginTop: '12px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>X Class Cities (Metros like Delhi, Mumbai, Bengaluru):</strong> Typically 27% of Basic Pay (revised to <strong>30%</strong> when DA crosses 50%).</li>
                    <li><strong>Y Class Cities (Tier 2 cities like Pune, Jaipur, Lucknow):</strong> Typically 18% of Basic Pay (revised to <strong>20%</strong> when DA crosses 50%).</li>
                    <li><strong>Z Class Cities (Other rural and semi-urban areas):</strong> Typically 9% of Basic Pay (revised to <strong>10%</strong> when DA crosses 50%).</li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Transport Allowance (TA) & Other Perks</h4>
                  <p style={{ margin: 0 }}>
                    TA is a flat amount granted to cover commuting expenses, varying by Pay Level and City Class. Additionally, employees receive <strong>DA on TA</strong>. Specific roles also have unique allowances, such as <strong>Military Service Pay (MSP)</strong> for defence personnel or Running Allowances for Railway Loco Pilots.
                  </p>
                </div>
              </div>
            </div>

            {/* Callout Box - Equation */}
            <div className="callout-box" style={{ background: 'rgba(var(--accent-rgb), 0.05)', borderLeft: '4px solid var(--accent)', padding: 'clamp(16px, 4vw, 24px)', borderRadius: '0 8px 8px 0' }}>
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>The Mathematical Formula</h4>
              <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 'clamp(13px, 3.5vw, 15px)', color: 'var(--text-primary)', background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', wordBreak: 'break-word' }}>
                <strong>Gross Salary</strong> = Basic Pay + DA + HRA + TA + (DA on TA) + Special Allowances
              </p>
            </div>

            {/* Deductions */}
            <div className="feature-card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(18px, 5vw, 22px)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                2. Mandatory Deductions (Gross vs. In-Hand)
              </h3>
              <p style={{ marginBottom: '16px' }}>
                Your Gross Salary is never the amount credited to your bank account. The government mandates several deductions to secure your future and provide health benefits.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '20px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>National Pension System (NPS)</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>The largest deduction. Exactly <strong>10% of (Basic Pay + DA)</strong> is deducted from your salary, while the government contributes an additional 14% to your retirement corpus.</p>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>CGHS / State Health Schemes</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>A flat monthly deduction (e.g., ₹250 to ₹1000 depending on Pay Level) for comprehensive cashless medical facilities for you and your dependents.</p>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Income Tax & Professional Tax</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>TDS (Tax Deducted at Source) is cut based on your annual income bracket. Additionally, state governments levy a nominal Professional Tax (usually ₹200/month).</p>
                </div>
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#991b1b', fontWeight: 600, wordBreak: 'break-word' }}>
                  <strong>In-Hand Salary</strong> = Gross Salary - (NPS + CGHS + CGEGIS + Income Tax + Professional Tax)
                </p>
              </div>
            </div>

            {/* Comparisons */}
            <div className="article-block">
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '22px', marginBottom: '16px' }}>
                3. Career Growth and the MACP Scheme
              </h3>
              <p>
                One of the most attractive features of a government job is assured career progression. Under the <strong>Modified Assured Career Progression (MACP)</strong> scheme, if an employee does not receive a regular promotion within 10, 20, or 30 years of service, they are automatically granted the financial benefits (Grade Pay/Level upgrade) of the next promotional post.
              </p>
              <p style={{ marginTop: '16px' }}>
                For example, an SSC CGL Auditor (Level 5) who isn't promoted for 10 years will automatically start drawing the salary of a Level 6 employee. Combined with the annual 3% basic pay increment and bi-annual DA hikes, the compound growth of a government salary over a 30-year career is highly lucrative, fully protecting the employee against economic downturns and inflation.
              </p>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
