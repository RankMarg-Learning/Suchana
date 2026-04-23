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
  Award
} from 'lucide-react';

import { getMetadataForCategory } from '../topic-metadata';

interface Props {
  params: Promise<{ category: string }>;
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
    default:
      return base;
  }
}

export async function generateStaticParams() {
  return ARTICLE_CATEGORIES.map((cat) => ({
    category: enumToSlug(cat.value),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: catSlug } = await params;
  const catEnum = slugToEnum(catSlug) as SeoPageCategory;

  const categoryData = ARTICLE_CATEGORIES.find(c => c.value === catEnum);
  const label = categoryData?.label || cleanLabel(catEnum);

  return getMetadataForCategory(catEnum, label);
}

export default async function DynamicCategoryPage({ params }: Props) {
  const { category: catSlug } = await params;
  const catEnum = slugToEnum(catSlug) as SeoPageCategory;

  const categoryData = ARTICLE_CATEGORIES.find(c => c.value === catEnum);
  if (!categoryData) notFound();

  const label = categoryData.label;
  const ui = getCategoryUI(catEnum);
  console.log("label", label);
  console.log("catEnum", catEnum);

  return (
    <Suspense fallback={
      <main className="min-h-screen">
        <div className="app-shell" style={{ opacity: 0.1 }}>
          <aside className="sidebar-left"><div className="sidebar-widget"><div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} /></div></aside>
          <section className="feed-main">
            <div className="feed-header"><div className="skeleton" style={{ height: '120px', borderRadius: '16px' }} /></div>
            <div className="article-skeleton-list" style={{ marginTop: '32px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="article-skeleton-item">
                  <div className="skeleton" style={{ height: '24px', width: '60%', borderRadius: '4px', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          </section>
          <aside className="sidebar-right"><div className="sidebar-widget"><div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} /></div></aside>
        </div>
      </main>
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
