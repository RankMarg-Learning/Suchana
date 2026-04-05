/**
 * Utility for generating high-performance, viral social sharing messages
 * specifically for Intelligence Hub Articles (SeoPages).
 * Optimized for WhatsApp and Telegram.
 */

interface ArticleTemplateParams {
    title: string;
    category: string;
    slug: string;
    examTitle?: string;
    examShortTitle?: string;
}

export const generateArticleFOMOContent = ({
    title,
    slug,
    examTitle,
    examShortTitle
}: ArticleTemplateParams) => {
    // Article URL
    const url = `https://examsuchana.in/${slug}`;
    const b = (text: string) => `*${text}*`;
    
    const examLabel = examShortTitle || examTitle || 'Latest Update';
    
    const text = `📢 ${b(examLabel)}: ${title}\n\n🎯 ${b('Read full breakdown here')}:\n${url}\n\n📡 ${b('Stay ahead with Exam Suchana!')}`;
    
    return text;
};
