import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const components: Components = {
  // 标题样式
  h1: ({ children }) => (
    <h1 style={{ fontSize: "20px", fontWeight: 400, margin: "28px 0 12px", lineHeight: 1.3, color: "var(--text-charcoal)" }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: "17px", fontWeight: 400, margin: "24px 0 10px", lineHeight: 1.3, color: "var(--text-charcoal)" }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: "15px", fontWeight: 400, margin: "20px 0 8px", lineHeight: 1.3, color: "var(--text-charcoal)" }}>
      {children}
    </h3>
  ),
  // 段落
  p: ({ children }) => (
    <p style={{ fontSize: "14px", lineHeight: 1.8, color: "var(--text-charcoal)", margin: "0 0 14px", whiteSpace: "pre-wrap" }}>
      {children}
    </p>
  ),
  // 粗体 & 斜体
  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
  em: ({ children }) => <em style={{ fontStyle: "italic" }}>{children}</em>,
  // 代码
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code style={{
          backgroundColor: "rgba(0,0,0,0.06)",
          padding: "2px 6px",
          borderRadius: "3px",
          fontSize: "12px",
          fontFamily: "'Space Mono', monospace",
          color: "#E74C3C",
        }}>
          {children}
        </code>
      );
    }
    return (
      <pre style={{
        backgroundColor: "rgba(0,0,0,0.04)",
        padding: "16px",
        borderRadius: "4px",
        overflow: "auto",
        fontSize: "12px",
        lineHeight: 1.6,
        fontFamily: "'Space Mono', monospace",
        border: "1px solid var(--border-light)",
        margin: "16px 0",
      }}>
        <code className={className} {...props}>{children}</code>
      </pre>
    );
  },
  // 列表
  ul: ({ children }) => (
    <ul style={{ paddingLeft: "20px", margin: "0 0 14px", lineHeight: 1.8, fontSize: "14px", color: "var(--text-charcoal)" }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: "20px", margin: "0 0 14px", lineHeight: 1.8, fontSize: "14px", color: "var(--text-charcoal)" }}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li style={{ marginBottom: "4px" }}>{children}</li>,
  // 引用
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: "3px solid var(--accent-teal)",
      margin: "16px 0",
      padding: "8px 16px",
      backgroundColor: "rgba(0,0,0,0.02)",
      fontStyle: "italic",
      color: "var(--text-grey)",
    }}>
      {children}
    </blockquote>
  ),
  // 链接
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-teal)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
      {children}
    </a>
  ),
  // 分割线
  hr: () => <hr style={{ border: "none", borderTop: "1px solid var(--border-light)", margin: "24px 0" }} />,
  // 图片
  img: ({ src, alt }) => (
    <img src={src} alt={alt || ""} style={{ maxWidth: "100%", height: "auto", margin: "16px 0", border: "1px solid var(--border-light)" }} loading="lazy" />
  ),
  // 表格
  table: ({ children }) => (
    <div style={{ overflow: "auto", margin: "16px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", lineHeight: 1.6 }}>
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{ border: "1px solid var(--border-light)", padding: "8px 12px", fontWeight: 600, textAlign: "left", backgroundColor: "rgba(0,0,0,0.02)" }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ border: "1px solid var(--border-light)", padding: "8px 12px" }}>
      {children}
    </td>
  ),
};

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
