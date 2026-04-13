import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { ExternalLink, Info, AlertTriangle, Lightbulb, ArrowRight, Send, Calendar, MessageCircle } from "lucide-react";
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
            
            if (custom === 'read-more') {
              return (
                <div className="callout-box callout-related">
                  <div className="callout-icon"><ArrowRight size={18} /></div>
                  <div className="callout-content">
                    <a href={url}>{label}</a>
                  </div>
                </div>
              );
            }
            if (custom === 'telegram') {
              return (
                <div className="callout-box callout-telegram">
                  <div className="callout-icon"><Send size={18} /></div>
                  <div className="callout-content">
                    <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
                  </div>
                </div>
              );
            }
            if (custom === 'whatsapp') {
              return (
                <div className="callout-box callout-whatsapp">
                  <div className="callout-icon"><MessageCircle size={18} /></div>
                  <div className="callout-content">
                    <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
                  </div>
                </div>
              );
            }
            if (custom === 'timeline') {
              return (
                <div className="callout-box callout-timeline">
                  <div className="callout-icon"><Calendar size={18} /></div>
                  <div className="callout-content">
                    <a href={url}>{label}</a>
                  </div>
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
