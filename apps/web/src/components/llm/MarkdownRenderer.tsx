/**
 * Markdown渲染组件
 * 支持完整的Markdown语法渲染，包括代码高亮、表格、链接等
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';

// 导入代码高亮样式
import 'highlight.js/styles/github.css';
// 导入自定义Markdown样式
import './markdown-styles.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
}

export function MarkdownRenderer({
  content,
  className,
  isStreaming,
}: MarkdownRendererProps) {
  return (
    <div className={cn('markdown-content', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // 标题样式
          h1: ({ children, ...props }) => (
            <h1 className="markdown-h1" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="markdown-h2" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="markdown-h3" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="markdown-h4" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="markdown-h5" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="markdown-h6" {...props}>
              {children}
            </h6>
          ),

          // 段落样式
          p: ({ children, ...props }) => (
            <p
              className="text-sm leading-relaxed text-gray-800 mb-3 last:mb-0"
              {...props}
            >
              {children}
            </p>
          ),

          // 列表样式
          ul: ({ children, ...props }) => (
            <ul className="markdown-list markdown-ul" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="markdown-list markdown-ol" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="markdown-list-item" {...props}>
              {children}
            </li>
          ),

          // 代码块样式
          pre: ({ children, ...props }) => (
            <pre className="markdown-code-block" {...props}>
              {children}
            </pre>
          ),
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="markdown-inline-code" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={cn('markdown-code', className)} {...props}>
                {children}
              </code>
            );
          },

          // 引用块样式
          blockquote: ({ children, ...props }) => (
            <blockquote className="markdown-blockquote" {...props}>
              {children}
            </blockquote>
          ),

          // 链接样式
          a: ({ children, href, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="markdown-link"
              {...props}
            >
              {children}
            </a>
          ),

          // 表格样式
          table: ({ children, ...props }) => (
            <div className="markdown-table-wrapper">
              <table className="markdown-table" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="markdown-table-head" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="markdown-table-body" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr className="markdown-table-row" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th className="markdown-table-header" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="markdown-table-cell" {...props}>
              {children}
            </td>
          ),

          // 分隔线样式
          hr: ({ ...props }) => (
            <hr className="my-6 border-gray-300" {...props} />
          ),

          // 强调样式
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-gray-900" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-gray-800" {...props}>
              {children}
            </em>
          ),

          // 删除线样式
          del: ({ children, ...props }) => (
            <del className="line-through text-gray-500" {...props}>
              {children}
            </del>
          ),

          // 任务列表样式
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },

          // 图片样式
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg border border-gray-200 mb-4"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      {/* 流式处理时的光标动画 */}
      {isStreaming && <span className="streaming-cursor" />}
    </div>
  );
}
