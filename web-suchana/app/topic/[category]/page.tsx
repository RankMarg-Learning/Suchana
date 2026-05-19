import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CategoryFeedClient from '../../components/CategoryFeedClient';
import { SeoPageCategory, ARTICLE_CATEGORIES } from '../../lib/enums';
import { slugToEnum, enumToSlug, cleanLabel } from '../../lib/types';
import {
  Book,
  Newspaper,
  FileText,
  Info,
  Calendar,
  CheckCircle,
  AlertCircle,
  BadgeCheck,
  Briefcase,
  Wallet,
  HelpCircle,
  TrendingUp,
  Award,
  FileEdit,
  BarChart2,
  Globe
} from 'lucide-react';

import { getMetadataForCategory } from '../topic-metadata';

interface Props {
  params: Promise<{ category: string }>;
}

function mapSlugToCategoryEnum(slug: string): SeoPageCategory | null {
  const norm = slug.toLowerCase();

  if (norm === 'previous-year-papers' || norm === 'previous-year-paper') {
    return SeoPageCategory.PREVIOUS_YEAR_PAPER;
  }
  if (norm === 'exam-analysis' || norm === 'analysis') {
    return SeoPageCategory.ANALYSIS;
  }
  if (norm === 'gk-static' || norm === 'gk-static') {
    return SeoPageCategory.GK_STATIC;
  }
  if (norm === 'preparation-guides' || norm === 'preparation-strategy') {
    return SeoPageCategory.PREPARATION_STRATEGY;
  }

  const standard = norm.toUpperCase().replace(/-/g, '_');
  const exists = ARTICLE_CATEGORIES.some(c => c.value === standard);
  if (exists) {
    return standard as SeoPageCategory;
  }

  return null;
}

function getCategoryUI(cat: SeoPageCategory) {
  const base = {
    icon: <FileText size={28} />,
    subtitle: `Get latest ${cleanLabel(cat)} updates and resources.`,
    trendingTitle: `Trending ${cleanLabel(cat)}`
  };

  switch (cat) {
    case SeoPageCategory.BOOKS:
      return {
        icon: <Book size={28} />,
        subtitle: "Best study material and highly recommended resources.",
        trendingTitle: "Trending Books"
      };
    case SeoPageCategory.CURRENT_AFFAIRS:
      return {
        icon: <Newspaper size={28} />,
        subtitle: "Daily news, updates, and analysis for your preparation.",
        trendingTitle: "Trending News"
      };
    case SeoPageCategory.SYLLABUS:
      return {
        icon: <HelpCircle size={28} />,
        subtitle: "Detailed exam syllabus and topic-wise breakdown.",
        trendingTitle: "Updated Syllabus"
      };
    case SeoPageCategory.RESULT:
      return {
        icon: <Award size={28} />,
        subtitle: "Latest exam results, merit lists, and scorecards.",
        trendingTitle: "Latest Results"
      };
    case SeoPageCategory.NOTIFICATION:
      return {
        icon: <Calendar size={28} />,
        subtitle: "New recruitment notifications and official announcements.",
        trendingTitle: "Latest Notifications"
      };
    case SeoPageCategory.ADMIT_CARD:
      return {
        icon: <BadgeCheck size={28} />,
        subtitle: "Download links and updates for upcoming exam admit cards.",
        trendingTitle: "Available Admit Cards"
      };
    case SeoPageCategory.SALARY:
      return {
        icon: <Wallet size={28} />,
        subtitle: "Salary structures, pay scales, and job profiles.",
        trendingTitle: "Top Salaries"
      };
    case SeoPageCategory.VACANCY:
      return {
        icon: <Briefcase size={28} />,
        subtitle: "Comprehensive vacancy details and post-wise breakdown.",
        trendingTitle: "Mega Vacancies"
      };
    case SeoPageCategory.PREVIOUS_YEAR_PAPER:
      return {
        icon: <FileEdit size={28} />,
        subtitle: "Practice with previous years' solved papers and actual exam questions.",
        trendingTitle: "Trending PYQ Papers"
      };
    case SeoPageCategory.ANALYSIS:
      return {
        icon: <BarChart2 size={28} />,
        subtitle: "Detailed exam reviews, difficulty levels, and expected cutoff analysis.",
        trendingTitle: "Latest Exam Analyses"
      };
    case SeoPageCategory.GK_STATIC:
      return {
        icon: <Globe size={28} />,
        subtitle: "Comprehensive static general knowledge updates and subject notes.",
        trendingTitle: "GK Resources"
      };
    case SeoPageCategory.PREPARATION_STRATEGY:
      return {
        icon: <TrendingUp size={28} />,
        subtitle: "Expert-curated exam strategy, preparation schedules, and tips.",
        trendingTitle: "Popular Guides"
      };
    default:
      return base;
  }
}

export async function generateStaticParams() {
  const slugs = new Set<string>();
  ARTICLE_CATEGORIES.forEach((cat) => {
    const stdSlug = enumToSlug(cat.value);
    slugs.add(stdSlug);

    // Add common prettier/pluralized aliases used in menus and urls
    if (cat.value === SeoPageCategory.PREVIOUS_YEAR_PAPER) {
      slugs.add('previous-year-papers');
    } else if (cat.value === SeoPageCategory.ANALYSIS) {
      slugs.add('exam-analysis');
    } else if (cat.value === SeoPageCategory.GK_STATIC) {
      slugs.add('gk-static');
    } else if (cat.value === SeoPageCategory.PREPARATION_STRATEGY) {
      slugs.add('preparation-guides');
    }
  });

  return Array.from(slugs).map(slug => ({
    category: slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: catSlug } = await params;
  const catEnum = mapSlugToCategoryEnum(catSlug);

  if (!catEnum) {
    return {
      title: 'Page Not Found | Exam Suchana',
    };
  }

  const categoryData = ARTICLE_CATEGORIES.find(c => c.value === catEnum);
  const label = categoryData?.label || cleanLabel(catEnum);

  return getMetadataForCategory(catEnum, label);
}

export default async function DynamicCategoryPage({ params }: Props) {
  const { category: catSlug } = await params;
  const catEnum = mapSlugToCategoryEnum(catSlug);

  if (!catEnum) notFound();

  const categoryData = ARTICLE_CATEGORIES.find(c => c.value === catEnum);
  if (!categoryData) notFound();

  const label = categoryData.label;
  const ui = getCategoryUI(catEnum);

  return (
    <Suspense fallback={
      <div className="home-body min-h-screen">
        <div className="wrap-home" style={{ marginTop: '20px' }}>
          <div className="ad-leader animate-pulse" style={{ height: '90px', background: 'var(--border)' }} />
        </div>
        <div className="wrap-home">
          <div className="page-grid" style={{ opacity: 0.15 }}>
            <div className="content-col">
              <div className="sh">
                <div className="skeleton" style={{ height: '36px', width: '45%', borderRadius: '4px' }} />
              </div>
              <div className="skeleton" style={{ height: '16px', width: '70%', borderRadius: '4px', marginBottom: '24px' }} />
              <div className="skeleton" style={{ height: '42px', borderRadius: '4px', marginBottom: '24px' }} />
              <div className="article-skeleton-list">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="article-skeleton-item" style={{ padding: '20px 8px', borderBottom: '1px solid var(--border)' }}>
                    <div className="skeleton" style={{ height: '24px', width: '65%', borderRadius: '4px', marginBottom: '12px' }} />
                    <div className="skeleton" style={{ height: '14px', width: '25%', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="sidebar-col">
              <div className="sw animate-pulse" style={{ height: '220px', border: '1px solid var(--border)' }}>
                <div className="sw-head flex items-center gap-1.5">
                  <div className="skeleton" style={{ height: '16px', width: '120px' }} />
                </div>
                <div className="sw-body">
                  <div className="skeleton" style={{ height: '120px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <CategoryFeedClient
        category={catEnum}
        title={label}
        subtitle={ui.subtitle}
        icon={ui.icon}
        trendingTitle={ui.trendingTitle}
        searchPlaceholder={`Search ${label.toLowerCase()} resources...`}
      />
    </Suspense>
  );
}
