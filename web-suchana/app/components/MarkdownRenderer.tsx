import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { ExternalLink, Info, AlertTriangle, Lightbulb, ArrowRight, Send, Calendar, MessageCircle, BookOpen, ChevronDown, CheckCircle } from "lucide-react";
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

    // 7. Button: [BUTTON: Label | URL | align(optional)]
    final = final.replace(/\[BUTTON:\s*(.*?)\s*\|\s*(.*?)(?:\s*\|\s*(left|center|right))?\s*\]/gi, '<div data-custom="button" data-label="$1" data-url="$2" data-align="$3"></div>');

    // 8. MCQ: [MCQ: Question | Opt1; Opt2; Opt3; Opt4 | AnswerIndex | Solution]
    final = final.replace(/\[MCQ:\s*([\s\S]*?)\s*\|\s*([\s\S]*?)\s*\|\s*(\d+)\s*\|\s*([\s\S]*?)\s*\]/gi, (match, q, opts, ans, sol) => {
      const escape = (s: string) => s.replace(/\n/g, '\\n').replace(/"/g, '&quot;');
      return `\n\n<div data-custom="mcq" data-question="${escape(q)}" data-options="${escape(opts)}" data-answer="${ans}" data-solution="${escape(sol)}"></div>\n\n`;
    });

    return formatDatesInText(final, includeTime);
  }, [content, includeTime]);

  if (!content) return null;

  return (
    <div className={`markdown-renderer ${variant}-variant ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          h2: ({ children }) => {
            const id = generateHeadingId(children);
            return <h2 id={id}>{children}</h2>;
          },
          h3: ({ children }) => {
            const id = generateHeadingId(children);
            return <h3 id={id}>{children}</h3>;
          },
          h4: ({ children }) => {
            const id = generateHeadingId(children);
            return <h4 id={id}>{children}</h4>;
          },
          div: ({ node, ...props }: any) => {
            const custom = props['data-custom'];
            const label = props['data-label'];
            const url = props['data-url'];
            const image = props['data-image'];
            const className = props.className || '';

            if (typeof className === 'string' && (className.includes('katex-display') || className.includes('math-display'))) {
              return (
                <div className="overflow-x-auto overflow-y-hidden max-w-full pb-2 hide-scrollbar">
                  <div {...props} />
                </div>
              );
            }

            if (custom === 'button') {
              const align = props['data-align']?.toLowerCase() || 'center';
              return (
                <div style={{ textAlign: align as any, margin: '24px 0' }}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="btn-black no-underline">
                    {label}
                  </a>
                </div>
              );
            }
            if (custom === 'mcq') {
              const unescape = (s: string) => s?.replace(/\\n/g, '\n') || '';

              // Handle new format (data-content) for transition period, or fallback to individual attributes
              const rawContent = props['data-content'] || '';
              if (rawContent) {
                const decoded = rawContent.replace(/__BR__/g, '\n');
                const parts = decoded.split('|').map((s: string) => s.trim());
                if (parts.length >= 3) {
                  const question = parts[0];
                  const options = parts[1]?.split(';').map((o: string) => o.trim()).filter(Boolean) || [];
                  const answerIndex = parseInt(parts[2]) - 1;
                  const solution = parts[3] || '';
                  return <MCQItem question={question} options={options} answerIndex={answerIndex} solution={solution} />;
                }
              }

              // Default: Use individual attributes (backward compatible)
              const question = unescape(props['data-question']);
              const options = unescape(props['data-options'])?.split(';').map((o: string) => o.trim()).filter(Boolean) || [];
              const answerIndex = parseInt(props['data-answer']) - 1;
              const solution = unescape(props['data-solution']);

              return <MCQItem question={question} options={options} answerIndex={answerIndex} solution={solution} />;
            }
            if (custom === 'read-more') {
              return (
                <div className="callout-box callout-related !border-x-0 !rounded-none !pl-0 !items-center gap-3">
                  <div className="flex-shrink-0">
                    <span className="bg-primary text-primary-foreground text-[9px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      Read More
                    </span>
                  </div>
                  <div className="callout-content">
                    <a href={url} className="underline underline-offset-4 font-bold decoration-primary/40">{label}</a>
                  </div>
                </div>
              );
            }
            if (custom === 'telegram') {
              return (
                <a href={url} target="_blank" rel="noopener noreferrer" className="block my-6 no-underline group">
                  <div className="p-4 rounded-none bg-[#0088cc]/5 border border-[#0088cc]/20 flex items-center justify-between transition-colors hover:bg-[#0088cc]/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex-shrink-0 rounded-none bg-[#0088cc] flex items-center justify-center text-white">
                        <Send size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#0088cc] uppercase tracking-wider leading-none mb-1">LATEST UPDATES</span>
                        <span className="text-[15px] font-bold text-gray-900 line-clamp-1 group-hover:text-[#0088cc] transition-colors">
                          {label}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <div className="bg-[#0088cc] text-white text-[11px] font-black px-4 py-1.5 rounded-none uppercase tracking-wider">JOIN</div>
                    </div>
                  </div>
                </a>
              );
            }
            if (custom === 'whatsapp') {
              return (
                <a href={url} target="_blank" rel="noopener noreferrer" className="block my-6 no-underline group">
                  <div className="p-4 rounded-none bg-[#25d366]/5 border border-[#25d366]/20 flex items-center justify-between transition-colors hover:bg-[#25d366]/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex-shrink-0 rounded-none bg-[#25d366] flex items-center justify-center text-white">
                        <MessageCircle size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#25d366] uppercase tracking-wider leading-none mb-1">INSTANT ALERTS</span>
                        <span className="text-[15px] font-bold text-gray-900 line-clamp-1 group-hover:text-[#25d366] transition-colors">
                          {label}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <div className="bg-[#25d366] text-white text-[11px] font-black px-4 py-1.5 rounded-none uppercase tracking-wider">JOIN</div>
                    </div>
                  </div>
                </a>
              );
            }
            if (custom === 'timeline') {
              return (
                <a href={url} className="block my-6 no-underline group">
                  <div className="p-4 rounded-none bg-primary/5 border border-primary/20 flex items-center justify-between transition-colors hover:bg-primary/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex-shrink-0 rounded-none bg-primary flex items-center justify-center text-white">
                        <Calendar size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none mb-1">EXAM SCHEDULE</span>
                        <span className="text-[15px] font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                          {label}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                      <span className="hidden sm:block text-[11px] font-bold text-primary tracking-wider">VIEW TIMELINE</span>
                      <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
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
          span: ({ node, className, children, ...props }: any) => {
            if (typeof className === 'string' && (className.includes('katex-display') || className.includes('math-display'))) {
              return (
                <span className="overflow-x-auto overflow-y-hidden max-w-full pb-2 block hide-scrollbar">
                  <span className={className} {...props}>{children}</span>
                </span>
              );
            }
            return <span className={className} {...props}>{children}</span>;
          },
          ul: ({ node, ...props }) => (
            <ul className="hb-list" style={{ marginBottom: '20px' }} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol style={{ paddingLeft: '24px', marginBottom: '20px', listStyleType: 'decimal', fontSize: '16px', lineHeight: '1.85' }} {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="table-responsive">
              <table className="info-table" {...props} />
            </div>
          ),
          hr: () => <hr style={{ margin: '24px 0', border: 'none', borderBottom: '1px solid var(--border)' }} />,
          a: ({ node, href, children, ...props }) => {
            const isInternal = href?.startsWith('/') || href?.startsWith('#');
            return (
              <a
                {...props}
                href={href}
                target={isInternal ? "_self" : "_blank"}
                rel={isInternal ? "" : "noopener noreferrer"}
              >
                {children}
                {!isInternal && <ExternalLink size={12} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'baseline', opacity: 0.6 }} />}
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

function MCQItem({ question, options, answerIndex, solution }: { question: string, options: string[], answerIndex: number, solution: string }) {
  const [selected, setSelected] = useState<number | null>(null);

  const markdownComponents = {
    p: ({ children }: any) => <span className="block mb-1 last:mb-0">{children}</span>,
    u: ({ children }: any) => <span className="underline underline-offset-2 decoration-1">{children}</span>,
    a: ({ node, href, children, ...props }: any) => (
      <a {...props} href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    span: ({ node, className, children, ...props }: any) => {
      if (typeof className === 'string' && (className.includes('katex-display') || className.includes('math-display'))) {
        return (
          <span className="overflow-x-auto overflow-y-hidden max-w-full pb-2 block hide-scrollbar">
            <span className={className} {...props}>{children}</span>
          </span>
        );
      }
      return <span className={className} {...props}>{children}</span>;
    },
    div: ({ node, className, children, ...props }: any) => {
      if (typeof className === 'string' && (className.includes('katex-display') || className.includes('math-display'))) {
        return (
          <div className="overflow-x-auto overflow-y-hidden max-w-full pb-2 hide-scrollbar">
            <div className={className} {...props}>{children}</div>
          </div>
        );
      }
      return <div className={className} {...props}>{children}</div>;
    },
  };

  return (
    <div className="my-2 gap-2 text-left mb-4 w-full">
      <div className="flex gap-0 mb-2 w-full">
        <div className="text-base font-bold text-slate-900 leading-tight m-0 min-w-0 w-full overflow-x-hidden">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            components={markdownComponents}
          >
            {question}
          </ReactMarkdown>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {options.map((opt: string, idx: number) => {
          const isCorrect = idx === answerIndex;
          const isSelected = selected === idx;
          const showResult = selected !== null;

          let stateClasses = "bg-white border-slate-200 hover:border-primary/40 hover:bg-slate-50";
          if (showResult) {
            if (isCorrect) {
              stateClasses = "bg-emerald-50 border-emerald-500 text-emerald-700";
            } else if (isSelected) {
              stateClasses = "bg-rose-50 border-rose-500 text-rose-700";
            } else {
              stateClasses = "bg-white border-slate-100 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              disabled={showResult}
              onClick={() => setSelected(idx)}
              className={`w-full flex items-center gap-3 p-1.5 border rounded-none transition-all text-left group ${stateClasses} ${!showResult ? 'active:scale-[0.98]' : ''}`}
            >
              <div className={`w-8 h-8 rounded-none flex items-center justify-center text-xs font-black transition-colors flex-shrink-0 ${showResult && isCorrect ? 'bg-emerald-500 text-white' :
                showResult && isSelected ? 'bg-rose-500 text-white' :
                  'bg-slate-100 text-slate-500 group-hover:bg-primary group-hover:text-white'
                }`}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="text-sm font-semibold leading-snug">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                  rehypePlugins={[rehypeRaw, rehypeKatex]}
                  components={markdownComponents}
                >
                  {opt}
                </ReactMarkdown>
              </span>
              {showResult && isCorrect && <CheckCircle size={20} className="ml-auto text-emerald-600" />}
              {showResult && isSelected && !isCorrect && <AlertTriangle size={20} className="ml-auto text-rose-600" />}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <details className="group border-t border-slate-100 pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <summary className="flex items-center justify-between cursor-pointer list-none text-primary font-bold text-sm hover:opacity-80 transition-opacity select-none">
            <span className="flex items-center gap-2">
              <Lightbulb size={18} />
              View Explanation
            </span>
            <ChevronDown size={20} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-5 p-5 bg-slate-50 border border-slate-100 rounded-none text-base text-slate-700 leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={markdownComponents}
            >
              {solution}
            </ReactMarkdown>
          </div>
        </details>
      )}
    </div>
  );
}
