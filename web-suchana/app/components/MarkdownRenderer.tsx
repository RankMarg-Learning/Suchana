import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { ExternalLink, Info, AlertTriangle, Lightbulb } from "lucide-react";
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
    const unescaped = content.replace(/\\n/g, "\n");
    return formatDatesInText(unescaped, includeTime);
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
          blockquote: ({ children }) => {
            // Check for special callout prefixes like [!IMPORTANT] or **Important:**
            const firstChild = Array.isArray(children) ? children[0] : children;
            const textContent = typeof firstChild === 'string' ? firstChild : '';
            
            let type: 'info' | 'warning' | 'tip' | 'default' = 'default';
            let icon = null;
            
            if (textContent.includes('[!IMPORTANT]') || textContent.includes('Important:')) {
              type = 'warning';
              icon = <AlertTriangle size={18} />;
            } else if (textContent.includes('[!TIP]') || textContent.includes('Tip:')) {
              type = 'tip';
              icon = <Lightbulb size={18} />;
            } else if (textContent.includes('[!NOTE]') || textContent.includes('Note:')) {
              type = 'info';
              icon = <Info size={18} />;
            }

            return (
              <div className={`callout-box callout-${type}`}>
                {icon && <div className="callout-icon">{icon}</div>}
                <div className="callout-content">{children}</div>
              </div>
            );
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
