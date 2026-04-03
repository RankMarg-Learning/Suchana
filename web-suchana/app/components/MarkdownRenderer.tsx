import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { ExternalLink } from "lucide-react";
import { formatDatesInText } from "@/app/lib/types";

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
          table: ({ node, ...props }) => (
            <div className="table-responsive">
              <table {...props} />
            </div>
          ),
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
