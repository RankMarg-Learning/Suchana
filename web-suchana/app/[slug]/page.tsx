import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchSeoPageBySlug, fetchAllSeoPageSlugs, fetchExamBySlug, SITE_URL } from '@/app/lib/api';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { LeaderboardAd, InFeedAd } from '../components/AdUnits';
import ExamDetailClient from "../exam/[slug]/ExamDetailClient";
import { STATUS_LABELS, cleanLabel, formatDate, getTotalVacancies, SeoPage } from "@/app/lib/types";
import SeoExamPageLayout from '../components/SeoExamPageLayout';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await fetchAllSeoPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // 1. Try SEO Page Metadata first
  const page = await fetchSeoPageBySlug(slug);

  if (page) {
    const canonical = page.canonicalUrl || `${SITE_URL}/${slug}`;
    return {
      title: page.metaTitle || `${page.title} | Exam Suchana`,
      description: page.metaDescription,
      keywords: page.keywords,
      alternates: { canonical: canonical },
      openGraph: {
        title: page.metaTitle || page.title,
        description: page.metaDescription ?? undefined,
        url: canonical,
        siteName: 'Exam Suchana',
        images: page.ogImage ? [{ url: page.ogImage }] : undefined,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: page.metaTitle || page.title,
        description: page.metaDescription ?? undefined,
        images: page.ogImage ? [page.ogImage] : undefined,
      },
    };
  }

  // 2. Fallback to Exam Metadata if no SEO page exists
  const exam = await fetchExamBySlug(slug);
  if (exam) {
    const year = new Date().getFullYear();
    const title = exam.shortTitle ?? exam.title;
    const statusLabel = STATUS_LABELS[exam.status] ?? cleanLabel(exam.status);
    const vacancies = getTotalVacancies(exam.totalVacancies);
    const regEvent = exam.lifecycleEvents?.find((e) => e.stage === "REGISTRATION");
    const deadline = regEvent?.endsAt ? `Registration deadline ${formatDate(regEvent.endsAt)}.` : "";
    
    const seoTitle = `${title} Recruitment ${year}: Apply Online, Full Schedule, Vacancies & Eligibility`;
    const description = 
      exam.description
        ? `${exam.description.slice(0, 140)}... Status: ${statusLabel}. Vacancies: ${vacancies}. ${deadline} Get real-time updates on Exam Suchana.`
        : `${title} official notification by ${exam.conductingBody}. Status: ${statusLabel}. ${vacancies !== "TBA" ? `${vacancies} vacancies.` : ""} ${deadline} Check syllabus, result & admit card.`;
    
    return {
      title: seoTitle,
      description,
      alternates: {
        canonical: `${SITE_URL}/${slug}`,
      },
      openGraph: {
        title: `${title} Recruitment ${year} — Check Full Timeline & Details`,
        description,
        url: `${SITE_URL}/${slug}`,
        siteName: 'Exam Suchana',
        type: 'article',
        publishedTime: exam.createdAt,
        section: cleanLabel(exam.category),
        tags: [title, exam.conductingBody, cleanLabel(exam.category)],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} — ${statusLabel} Updates`,
        description: `${vacancies} vacancies. ${deadline} Full timeline on Exam Suchana.`,
      },
    };
  }

  return {
    title: 'Page Not Found | Exam Suchana',
  };
}

// ─── JSON-LD Builders (Moved from ExamDetailPage) ──────────────────────────────
function buildJobPostingJsonLd(exam: any) {
  const regEvent = exam.lifecycleEvents?.find((e: any) => e.stage === "REGISTRATION");
  const canonicalUrl = `${SITE_URL}/${exam.slug}`;
  return {
    "@type": "JobPosting",
    "@id": `${canonicalUrl}#job`,
    title: exam.title,
    description: exam.description || `${exam.title} — Government recruitment by ${exam.conductingBody}.`,
    hiringOrganization: {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: exam.conductingBody || "Government Agency",
      url: exam.officialWebsite || SITE_URL,
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressCountry: "IN", addressRegion: exam.state ?? "India" },
    },
    employmentType: "FULL_TIME",
    validThrough: regEvent?.endsAt ?? undefined,
    datePosted: regEvent?.startsAt ?? new Date().toISOString(),
    url: canonicalUrl,
  };
}

export default async function DynamicSlugPage({ params }: Props) {
  const { slug } = await params;
  
  // 1. Check for SEO Page (Custom Content or Linked Exam)
  const page = await fetchSeoPageBySlug(slug);

  if (page) {
    if (page.exam) {
      return (
        <SeoExamPageLayout
          exam={page.exam}
          seoPage={{
            ...page,
            title: page.title || page.exam.title
          } as SeoPage}
        />
      );
    }

    const articleJsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": page.title,
      "description": page.metaDescription,
      "image": page.ogImage,
      "author": { "@type": "Organization", "name": "Exam Suchana" },
      "datePublished": page.createdAt,
      "dateModified": page.updatedAt
    };

    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <SiteNav />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
        <main className="seo-page-container" style={{ paddingTop: 100, paddingBottom: 100, paddingLeft: '1rem', paddingRight: '1rem' }}>
          <div className="feed-main" style={{ margin: '0 auto', maxWidth: 800 }}>
            <div className="leaderboard-wrap" style={{ marginBottom: 40 }}>
              <LeaderboardAd id="seo-top-leaderboard" />
            </div>
            <article className="seo-article">
              <h1 className="seo-h1" style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '1.5rem', background: 'linear-gradient(to right, var(--text-primary), var(--accent-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {page.title}
              </h1>
              {page.ogImage && (
                <div className="seo-featured-image" style={{ marginBottom: '2rem', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}>
                  <img src={page.ogImage} alt={page.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              )}
              <div className="seo-content" style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.15rem' }}>
                <MarkdownRenderer content={page.content} />
              </div>
            </article>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // 2. Fallback to standard Exam page (Enables Root-level Exam URLs)
  const exam = await fetchExamBySlug(slug);
  if (exam) {
    const { fetchExamsFromAPI } = await import('@/app/lib/api');
    const { exams: relatedExams } = await fetchExamsFromAPI(1, 5, exam.category).catch(() => ({ exams: [] }));
    const filteredRelated = (relatedExams || []).filter(e => e.id !== exam.id).slice(0, 4);

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        buildJobPostingJsonLd(exam),
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ].filter(Boolean)
    };

    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ExamDetailClient exam={exam} relatedExams={filteredRelated} />
      </div>
    );
  }

  // 3. True 404
  notFound();
}
