import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchSeoPageBySlug, fetchAllSeoPageSlugs, SITE_URL } from '@/app/lib/api';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { LeaderboardAd, InFeedAd } from '../components/AdUnits';
import ExamDetailClient from "../exam/[slug]/ExamDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await fetchAllSeoPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchSeoPageBySlug(slug);

  if (!page) {
    return {
      title: 'Page Not Found | Exam Suchana',
    };
  }

  const canonical = page.canonicalUrl || `${SITE_URL}/${slug}`;

  return {
    title: page.metaTitle || `${page.title} | Exam Suchana`,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: {
      canonical: canonical,
    },
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

export default async function SeoDetailPage({ params }: Props) {
  const { slug } = await params;
  const page = await fetchSeoPageBySlug(slug);

  if (!page) {
    notFound();
  }

  // If this SEO page is linked to an exam, show the Exam Detail UI but with custom title
  if (page.exam) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <ExamDetailClient
          exam={{
            ...page.exam,
            title: page.title || page.exam.title // Prefer SEO page title if provided
          }}
        />
        {/* We can still optionally show the custom SEO content at the bottom of the feed if desired, 
           but for simplicity and to match the user request "same page like /exam/[slug]", we just use the client. */}
      </div>
    );
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": page.title,
    "description": page.metaDescription,
    "image": page.ogImage,
    "author": {
      "@type": "Organization",
      "name": "Exam Suchana"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Exam Suchana",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "datePublished": page.createdAt,
    "dateModified": page.updatedAt
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <SiteNav />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className="seo-page-container" style={{ paddingTop: 100, paddingBottom: 100, paddingLeft: '1rem', paddingRight: '1rem' }}>
        <div className="feed-main" style={{ margin: '0 auto', maxWidth: 800 }}>

          <div className="leaderboard-wrap" style={{ marginBottom: 40 }}>
            <LeaderboardAd id="seo-top-leaderboard" />
          </div>

          <article className="seo-article">
            <h1 className="seo-h1" style={{
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '1.5rem',
              background: 'linear-gradient(to right, var(--text-primary), var(--accent-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>{page.title}</h1>

            {page.ogImage && (
              <div className="seo-featured-image" style={{ marginBottom: '2rem', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}>
                <img src={page.ogImage} alt={page.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}

            <div className="seo-content" style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.15rem' }}>
              <MarkdownRenderer content={page.content} />
            </div>

            <div style={{ marginTop: 60, borderTop: '1px solid var(--border)', paddingTop: 40 }}>
              <InFeedAd id="seo-bottom-ad" index={0} />
            </div>
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
