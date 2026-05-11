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
            Exam Eligibility
          </div>
          <h1 className="section-title mx-auto" style={{ maxWidth: '800px', fontSize: 'clamp(32px, 8vw, 56px)', lineHeight: 1.2 }}>
            Government Exam <span className="text-accent">Age Calculator</span>
          </h1>
          <p className="section-desc mx-auto" style={{ fontSize: '18px', maxWidth: '700px' }}>
            Calculate your exact age (Years, Months, Days) against specific cut-off dates to verify your eligibility for UPSC, SSC, Banking, and Railways.
          </p>
        </div>
      </section>

      {/* ─── Calculator ─── */}
      <section className="section" style={{ paddingTop: '0' }}>
        <div className="container">
          <AgeCalculatorClient />
        </div>
      </section>

      {/* ─── SEO Content & Detailed Guide ─── */}
      <section className="section bg-secondary" style={{ paddingBottom: '80px' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 className="section-title" style={{ fontSize: '32px' }}>
              Understanding Age Limits for Government Exams
            </h2>
            <p className="section-desc" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '16px' }}>
              Navigating age criteria can be tricky. Learn about crucial cut-off dates, category relaxations, and standard limits for top competitive exams in India.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.8 }}>
            
            {/* Introduction */}
            <div className="article-block">
              <p>
                A single day can determine whether you are eligible to appear for a life-changing exam like the UPSC Civil Services or SSC CGL. Unlike private sector hiring, where age limits are flexible guidelines, government recruitment boards operate on strict, non-negotiable legal frameworks. If you exceed the maximum age limit by even 24 hours, your application will be instantly rejected by the automated screening systems.
              </p>
              <p style={{ marginTop: '16px' }}>
                Because of these rigid parameters, candidates cannot afford to estimate their age. You must calculate your exact age in <strong>Years, Months, and Days</strong>. Furthermore, commissions do not calculate your age based on the day you fill out the application form; instead, they measure it against a highly specific <strong>"Cut-Off Date"</strong> published in the official notification.
              </p>
            </div>

            {/* Crucial Concept */}
            <div className="feature-card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(18px, 5vw, 22px)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                1. The "Age As On" Cut-Off Date: Why It Matters
              </h3>
              <p>
                The most common mistake candidates make is assuming their current age is their official age for the exam. When a notification is released (e.g., in March), it will explicitly state: <em>"Age limit will be calculated as on 1st August of the examination year."</em>
              </p>
              <div style={{ background: '#f8fafc', borderLeft: '4px solid var(--accent)', padding: '16px', borderRadius: '0 8px 8px 0', margin: '20px 0' }}>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Practical Example:
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '15px' }}>
                  Suppose the maximum age limit for an exam is 30 years, and the cut-off date is <strong>1st August 2024</strong>. If your 30th birthday falls on <strong>15th July 2024</strong>, you will be exactly 30 years and 17 days old on the cut-off date. You will be disqualified for crossing the 30-year threshold, even if you applied back in March when you were only 29.
                </p>
              </div>
              <ul style={{ marginTop: '16px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>UPSC Civil Services (IAS/IPS):</strong> Historically, the Union Public Service Commission calculates your age strictly as on <strong>1st August</strong> of the year in which the examination is held.</li>
                <li><strong>SSC CGL / CHSL:</strong> The Staff Selection Commission frequently shifts its baseline. Depending on when the notification is delayed, they may use <strong>1st January</strong> or <strong>1st August</strong> of the recruitment year.</li>
                <li><strong>Banking Sector (IBPS / SBI / RBI):</strong> Banking institutions generally prefer the <strong>1st day of the month</strong> in which the official notification is published (e.g., 1st April).</li>
                <li><strong>Railway Recruitment Board (RRB):</strong> Often sets the cut-off date to <strong>1st July</strong> of the notification year.</li>
              </ul>
            </div>

            {/* Relaxations */}
            <div className="feature-card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(18px, 5vw, 22px)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                2. Standard Age Relaxations for Reserved Categories
              </h3>
              <p style={{ marginBottom: '16px' }}>
                To ensure equitable representation, the Government of India provides standardized upper-age relaxations for specific demographic categories. These relaxations are mathematically added to the maximum baseline age limit of the post. For instance, if a general category candidate is eligible up to 30 years of age, a candidate benefiting from a 5-year relaxation can apply until they turn 35.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>OBC (Non-Creamy Layer)</div>
                  <p style={{ margin: 0, fontSize: '14px' }}><strong>+ 3 Years</strong><br />Grants an additional 3 years. Note: Candidates in the 'Creamy Layer' are considered General/UR and receive no relaxation.</p>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>SC / ST Candidates</div>
                  <p style={{ margin: 0, fontSize: '14px' }}><strong>+ 5 Years</strong><br />Scheduled Castes and Scheduled Tribes receive a blanket 5-year extension on all central government exams.</p>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>PwBD Candidates</div>
                  <p style={{ margin: 0, fontSize: '14px' }}><strong>+ 10 to 15 Years</strong><br />Unreserved PwBD get 10 years. OBC PwBD get 13 years, and SC/ST PwBD get a massive 15-year extension.</p>
                </div>
              </div>

              <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#991b1b', fontWeight: 600, fontSize: '14px' }}>
                  <strong>Important Notice for Ex-Servicemen (ESM):</strong> Ex-servicemen age calculation is unique. Your effective age is calculated by deducting the length of your military service from your actual age. If the resulting age does not exceed the maximum age limit by more than 3 years, you are eligible.
                </p>
              </div>
            </div>

            {/* Document Verification */}
            <div className="feature-card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(18px, 5vw, 22px)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                3. The Golden Rule of Document Verification
              </h3>
              <p>
                When filling out application forms, many candidates face a dilemma: their actual date of birth differs from the date printed on their educational certificates due to clerical errors made during their childhood.
              </p>
              <p style={{ marginTop: '16px', fontWeight: 600 }}>
                Which Date of Birth does the government consider legally valid?
              </p>
              <p style={{ marginTop: '16px' }}>
                According to the strict guidelines followed by UPSC, SSC, and Banking boards, the <strong>only legally acceptable proof of age is your Matriculation (Class 10th) Certificate</strong> or an equivalent Secondary School Examination certificate. 
              </p>
              <ul style={{ marginTop: '16px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Do <strong>not</strong> enter the date of birth listed on your Aadhaar Card, PAN card, or standard Birth Certificate if it mismatches your 10th-grade marksheet.</li>
                <li>The data entered in your online application must be an exact, character-for-character match to your Class 10th board certificate.</li>
                <li>If there is an error in your 10th marksheet, you must undergo the lengthy process of getting it officially amended by the education board <em>before</em> applying. Affidavits are generally not accepted during document verification for age-related discrepancies.</li>
              </ul>
            </div>

            {/* FAQ Section */}
            <div className="feature-card" style={{ padding: 'clamp(20px, 4vw, 32px)', marginTop: '24px' }}>
              <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 'clamp(18px, 5vw, 22px)', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                Frequently Asked Questions (FAQs)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h4 style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
                    How is the age limit calculated for government exams?
                  </h4>
                  <p style={{ margin: 0, fontSize: '15px' }}>
                    Age is calculated strictly against a "Cut-Off Date" mentioned in the exam notification (e.g., 1st August 2024). You must subtract your Date of Birth from this cut-off date to find your exact age in years, months, and days.
                  </p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
                    Which Date of Birth is valid for SSC and UPSC?
                  </h4>
                  <p style={{ margin: 0, fontSize: '15px' }}>
                    The Date of Birth printed on your Class 10th (Matriculation) or Secondary School Examination Certificate is the <em>only</em> legally valid proof of age. Aadhaar or Birth Certificates are not accepted if they conflict with your 10th marksheet.
                  </p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
                    How much age relaxation is given to OBC candidates?
                  </h4>
                  <p style={{ margin: 0, fontSize: '15px' }}>
                    OBC candidates belonging to the "Non-Creamy Layer" are granted an upper age relaxation of <strong>3 years</strong> over the standard age limit. SC/ST candidates receive a 5-year relaxation.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
