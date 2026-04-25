import { fetchAuthorBySlug } from "../../lib/api";
import AuthorDetailClient from "../../components/AuthorDetailClient";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await fetchAuthorBySlug(slug);
  if (!author || 'error' in author) return { title: 'Author Not Found' };

  return {
    title: `${author.name} - Official Profile | Suchana`,
    description: author.bio || `View all exams and articles managed by ${author.name} on Suchana.`,
    openGraph: {
      images: author.image ? [author.image] : [],
    }
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;

  return <AuthorDetailClient slug={slug} />;
}
