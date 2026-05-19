import type { Metadata } from "next";
import AgeCalculatorClient from "./AgeCalculatorClient";
import { SITE_URL } from "../lib/api";

export const metadata: Metadata = {
  title: "Age Calculator for Government Exams 2026 | UPSC, SSC, Bank",
  description:
    "Calculate your exact age in years, months, and days as on any cut-off date. Verify eligibility for UPSC, SSC CGL, Banking, and RRB exams with category relaxations.",
  keywords: [
    "age calculator",
    "government exam age calculator",
    "UPSC age eligibility",
    "SSC CGL age limit",
    "calculate age as on date",
    "age relaxation calculator",
    "exact age calculator",
    "DOB calculator for exams"
  ],
  alternates: {
    canonical: `${SITE_URL}/age-calculator`,
  },
  openGraph: {
    title: "Age Calculator for Government Exams | Check Eligibility",
    description: "Calculate your exact age as on a specific cut-off date to verify your eligibility for top government exams. Includes OBC/SC/ST relaxation rules.",
    url: `${SITE_URL}/age-calculator`,
    type: "website",
  }
};

export default function AgeCalculatorPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Government Exam Age Calculator",
      url: `${SITE_URL}/age-calculator`,
      applicationCategory: "EducationalApplication",
      operatingSystem: "All",
      description: "Calculate your exact age in years, months, and days as on a specific cut-off date to check eligibility for government exams.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How is the age limit calculated for government exams?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Age is calculated as on a specific cut-off date mentioned in the official notification. You must subtract your Date of Birth from this cut-off date to find your exact age in years, months, and days."
          }
        },
        {
          "@type": "Question",
          name: "Which date of birth is valid for SSC and UPSC?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The Date of Birth printed on your Class 10th (Matriculation) Certificate is the only legally valid proof of age accepted by UPSC, SSC, and Banking recruitment boards."
          }
        },
        {
          "@type": "Question",
          name: "How much age relaxation is given to OBC candidates?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "OBC (Non-Creamy Layer) candidates are generally granted an upper age relaxation of 3 years over the maximum age limit prescribed for the general category."
          }
        }
      ]
    }
  ];

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="wrap-home" style={{ marginTop: '32px', marginBottom: '0' }}>
        {/* PREMIUM EDITOR HEADER */}
        <div className="about-header" style={{ marginBottom: '24px', borderBottom: '2px solid var(--ink)', paddingBottom: '24px' }}>
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <span className="hero-badge-dot" style={{ background: 'var(--accent, #7c3aed)' }} />
            Exam Eligibility Tracker
          </div>
          <h1 style={{ fontFamily: 'var(--hd)', fontSize: '38px', fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            Government Exam Age Calculator
          </h1>
          <p style={{ fontFamily: 'var(--body)', fontSize: '15px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Verify official age limits, relaxation matrices, and cutoff criteria for all Central & State exams
          </p>
        </div>
      </div>

      {/* CALCULATOR MAIN WITH INTEGRATED SEO DETAILS */}
      <AgeCalculatorClient>
        <div className="fade-up" style={{ marginTop: '40px' }}>
          
          <div className="sh">
            <div className="sh-title"><span className="cat-tag">GUIDE</span> Understanding Age Limits for Govt Exams</div>
          </div>
          
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--text2)', fontFamily: 'var(--body)', marginBottom: '16px' }}>
            A single day can determine whether you are eligible to appear for a life-changing exam like the UPSC Civil Services or SSC CGL. Unlike private sector hiring, where age limits are flexible guidelines, government recruitment boards operate on strict, non-negotiable legal frameworks. If you exceed the maximum age limit by even 24 hours, your application will be instantly rejected by the automated screening systems.
          </p>

          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--text2)', fontFamily: 'var(--body)', marginBottom: '24px' }}>
            Because of these rigid parameters, candidates cannot afford to estimate their age. You must calculate your exact age in <strong>Years, Months, and Days</strong> against the highly specific <strong>&quot;Cut-Off Date&quot;</strong> published in the official notification.
          </p>

          {/* 1. THE CUT-OFF DATE */}
          <div className="sh" style={{ marginTop: '32px' }}>
            <div className="sh-title"><span className="cat-tag">CUT-OFF</span> Crucial Baseline Dates</div>
          </div>
          
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--text2)', fontFamily: 'var(--body)' }}>
            The most common mistake candidates make is assuming their current age is their official age for the exam. When a notification is released, it will explicitly state: <em>&ldquo;Age limit will be calculated as on 1st August of the examination year.&rdquo;</em>
          </p>

          <div style={{ borderLeft: '3px solid var(--accent, #7c3aed)', padding: '16px 20px', margin: '20px 0', background: '#f9fafb', borderRadius: '0 4px 4px 0' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: 'var(--ink)' }}>
              Practical Example:
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '16px', lineHeight: 1.5, color: 'var(--text2)' }}>
              Suppose the maximum age limit for an exam is 30 years, and the cut-off date is <strong>1st August 2026</strong>. If your 30th birthday falls on <strong>15th July 2026</strong>, you will be exactly 30 years and 17 days old on the cut-off date. You will be disqualified for crossing the 30-year threshold, even if you applied when you were only 29.
            </p>
          </div>

          {/* 2. CATEGORY RELAXATIONS */}
          <div className="sh" style={{ marginTop: '32px' }}>
            <div className="sh-title"><span className="cat-tag">RELAXATION</span> Standard Upper Age Extensions</div>
          </div>
          
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--text2)', fontFamily: 'var(--body)', marginBottom: '16px' }}>
            To ensure equitable representation, the Government of India provides standardized upper-age relaxations for specific reserved categories:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', background: '#f9fafb', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)', marginBottom: '6px' }}>OBC Candidates</div>
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--text2)', lineHeight: 1.5 }}>
                <strong>+ 3 Years</strong> extension. Valid strictly for non-creamy layer certificates.
              </p>
            </div>
            <div style={{ padding: '16px', background: '#f9fafb', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)', marginBottom: '6px' }}>SC / ST Candidates</div>
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--text2)', lineHeight: 1.5 }}>
                <strong>+ 5 Years</strong> blanket extension on all central government recruitments.
              </p>
            </div>
            <div style={{ padding: '16px', background: '#f9fafb', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--ink)', marginBottom: '6px' }}>PwBD Candidates</div>
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--text2)', lineHeight: 1.5 }}>
                <strong>+ 10 to 15 Years</strong> extension depending on general, OBC, or SC/ST sub-categories.
              </p>
            </div>
          </div>

          {/* 3. DOCUMENT VERIFICATION */}
          <div className="sh" style={{ marginTop: '32px' }}>
            <div className="sh-title"><span className="cat-tag">VERIFY</span> Document Verification Rules</div>
          </div>
          
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--text2)', fontFamily: 'var(--body)' }}>
            According to the strict guidelines followed by UPSC, SSC, and Banking boards, the <strong>only legally acceptable proof of age is your Matriculation (Class 10th) Certificate</strong> or equivalent Secondary School board marksheet. Mismatches on Aadhaar or Birth Certificates will lead to disqualification if they conflict with your 10th certificate.
          </p>

          {/* FAQ */}
          <div className="sh" style={{ marginTop: '40px' }}>
            <div className="sh-title"><span className="cat-tag">FAQ</span> Frequently Asked Questions</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <h4 style={{ fontFamily: 'var(--hd)', fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                How is the age limit calculated for government exams?
              </h4>
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--text2)', lineHeight: 1.55 }}>
                Age is calculated strictly against a &ldquo;Cut-Off Date&rdquo; mentioned in the exam notification (e.g., 1st August 2026). You must subtract your Date of Birth from this cut-off date to find your exact age in years, months, and days.
              </p>
            </div>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <h4 style={{ fontFamily: 'var(--hd)', fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                Which Date of Birth is valid for SSC and UPSC?
              </h4>
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--text2)', lineHeight: 1.55 }}>
                The Date of Birth printed on your Class 10th (Matriculation) or Secondary School Examination Certificate is the <em>only</em> legally valid proof of age. Aadhaar or Birth Certificates are not accepted if they conflict with your 10th marksheet.
              </p>
            </div>
          </div>

        </div>
      </AgeCalculatorClient>
    </main>
  );
}
