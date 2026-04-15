import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { ExternalLink, Info, AlertTriangle, Lightbulb, ArrowRight, Send, Calendar, MessageCircle, BookOpen } from "lucide-react";
import { formatDatesInText, generateHeadingId } from "@/app/lib/types";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  variant?: 'default' | 'fact';
  includeTime?: boolean;
}

export default function MarkdownRenderer({
  content,
  className = "",
  variant = 'default',
  includeTime = false
}: MarkdownRendererProps) {
  const processedContent = useMemo(() => {
    if (!content) return "";
    let final = content.replace(/\\n/g, "\n");

    // 1. Timeline: [TIMELINE: Label | URL]
    final = final.replace(/\[TIMELINE:\s*(.*?)\s*\|\s*(.*?)\s*\]/gi, '<div data-custom="timeline" data-label="$1" data-url="$2"></div>');

    // 2. Read More: [READMORE: Label | URL]
    final = final.replace(/\[READMORE:\s*(.*?)\s*\|\s*(.*?)\s*\]/gi, '<div data-custom="read-more" data-label="$1" data-url="$2"></div>');

    // 3. Telegram: [TELEGRAM: Label | URL]
    final = final.replace(/\[TELEGRAM:\s*(.*?)\s*\|\s*(.*?)\s*\]/gi, '<div data-custom="telegram" data-label="$1" data-url="$2"></div>');

    // 4. WhatsApp: [WHATSAPP: Label | URL]
    final = final.replace(/\[WHATSAPP:\s*(.*?)\s*\|\s*(.*?)\s*\]/gi, '<div data-custom="whatsapp" data-label="$1" data-url="$2"></div>');

    // 5. Book: [BOOK: Title | Image | URL]
    final = final.replace(/\[BOOK:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\]/gi, '<div data-custom="book" data-label="$1" data-image="$2" data-url="$3"></div>');

    // 6. Mini Book Grid: [BOOKGRID: Title1|Img1|URL1 ; Title2|Img2|URL2 ; Title3|Img3|URL3]
    final = final.replace(/\[BOOKGRID:\s*(.*?)\s*\]/gi, (match, content) => {
      // Clean the content to be passed as an attribute
      const encoded = content.replace(/"/g, '&quot;');
      return `<div data-custom="book-grid" data-books="${encoded}"></div>`;
    });

    return formatDatesInText(final, includeTime);
  }, [content, includeTime]);

  if (!content) return null;

  return (
    <div className={`markdown-renderer ${variant}-variant ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h2: ({ children }) => <h2 id={generateHeadingId(children)}>{children}</h2>,
          h3: ({ children }) => <h3 id={generateHeadingId(children)}>{children}</h3>,
          h4: ({ children }) => <h4 id={generateHeadingId(children)}>{children}</h4>,
          div: ({ node, ...props }: any) => {
            const custom = props['data-custom'];
            const label = props['data-label'];
            const url = props['data-url'];
            const image = props['data-image'];

            if (custom === 'read-more') {
              return (
                <div className="read-more-card">
                  <div className="read-more-badge">Read More</div>
                  <div className="read-more-content">
                    <a href={url} className="read-more-link">
                      {label}
                      <ArrowRight size={14} className="read-more-arrow" />
                    </a>
                  </div>
                </div>
              );
            }
            if (custom === 'telegram') {
              return (
                <a href={url} target="_blank" rel="noopener noreferrer" className="block my-6 no-underline group">
                  <div className="p-4 rounded-xl bg-[#0088cc]/5 border border-[#0088cc]/10 flex items-center justify-between transition-all hover:bg-[#0088cc]/10 hover:border-[#0088cc]/30 active:scale-[0.99]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#0088cc] flex items-center justify-center text-white shadow-lg shadow-[#0088cc]/20 group-hover:scale-105 transition-transform">
                        <Send size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#0088cc] uppercase tracking-wider leading-none mb-1 opacity-70">LATEST UPDATES</span>
                        <span className="text-[15px] font-bold text-gray-900 group-hover:text-[#0088cc] transition-colors line-clamp-1">
                          {label}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <div className="bg-[#0088cc] text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-md group-hover:shadow-lg transition-all">JOIN</div>
                    </div>
                  </div>
                </a>
              );
            }
            if (custom === 'whatsapp') {
              return (
                <a href={url} target="_blank" rel="noopener noreferrer" className="block my-6 no-underline group">
                  <div className="p-4 rounded-xl bg-[#25d366]/5 border border-[#25d366]/10 flex items-center justify-between transition-all hover:bg-[#25d366]/10 hover:border-[#25d366]/30 active:scale-[0.99]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#25d366] flex items-center justify-center text-white shadow-lg shadow-[#25d366]/20 group-hover:scale-105 transition-transform">
                        <MessageCircle size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#25d366] uppercase tracking-wider leading-none mb-1 opacity-70">INSTANT ALERTS</span>
                        <span className="text-[15px] font-bold text-gray-900 group-hover:text-[#25d366] transition-colors line-clamp-1">
                          {label}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <div className="bg-[#25d366] text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-md group-hover:shadow-lg transition-all">JOIN</div>
                    </div>
                  </div>
                </a>
              );
            }
            if (custom === 'timeline') {
              return (
                <a href={url} className="block my-6 no-underline group">
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-between transition-all hover:bg-purple-100/50 hover:border-purple-200 active:scale-[0.99]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200 group-hover:scale-105 transition-transform">
                        <Calendar size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider leading-none mb-1 opacity-70">EXAM SCHEDULE</span>
                        <span className="text-[15px] font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                          {label}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                      <span className="hidden sm:block text-[11px] font-bold text-purple-700">VIEW TIMELINE</span>
                      <ArrowRight size={18} className="text-purple-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </a>
              );
            }
            if (custom === 'book') {
              return (
                <div className="book-card-container">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="book-card no-underline">
                    <div className="book-badge">Topper Recommended</div>
                    <div className="book-image">
                      <img src={image} alt={label} loading="lazy" />
                    </div>
                    <div className="book-info">
                      <h4 className="book-title">{label}</h4>
                      <div className="book-buy-btn">
                        <BookOpen size={14} className="mr-1" />
                        See Book
                      </div>
                    </div>
                  </a>
                </div>
              );
            }
            if (custom === 'book-grid') {
              const booksRaw = props['data-books'] || "";
              const books = booksRaw.split(';').map((b: string) => b.trim()).filter(Boolean);

              return (
                <div className="mini-book-grid">
                  {books.map((bookStr: string, idx: number) => {
                    const parts = bookStr.split('|').map(s => s.trim());
                    if (parts.length < 3) return null;

                    // The last two are always URL and Image
                    const bUrl = parts.pop();
                    const bImage = parts.pop();
                    const bTitle = parts.join(' | '); // Keep any extra pipes in title

                    if (!bTitle || !bImage || !bUrl) return null;

                    return (
                      <a key={idx} href={bUrl} target="_blank" rel="noopener noreferrer" className="mini-book-card no-underline">
                        <div className="mini-book-badge">Topper Recommended</div>
                        <div className="mini-book-image-container">
                          <img src={bImage} alt={bTitle} loading="lazy" />
                        </div>
                        <div className="mini-book-info-container">
                          <h5 className="mini-book-card-title" title={bTitle}>{bTitle}</h5>
                          <div className="mini-book-card-link">
                            See Book
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              );
            }
            return <div {...props} />;
          },
          table: ({ node, ...props }) => (
            <div className="table-responsive">
              <table {...props} />
            </div>
          ),
          hr: () => <hr className="markdown-hr" />,
          a: ({ node, href, children, ...props }) => {
            const isInternal = href?.startsWith('/') || href?.startsWith('#');
            return (
              <a
                {...props}
                href={href}
                className="markdown-link"
                target={isInternal ? "_self" : "_blank"}
                rel={isInternal ? "" : "noopener noreferrer"}
              >
                <span className="link-text">{children}</span>
                {!isInternal && <ExternalLink size={14} className="link-icon" style={{ display: 'inline', marginLeft: '2px', verticalAlign: 'middle' }} />}
              </a>
            );
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
