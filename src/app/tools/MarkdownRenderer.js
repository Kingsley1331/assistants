import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css"; // Import KaTeX CSS

function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {
        content
          .replace(/\\\[|\\\]/g, "$$") // replace \[ and \] with $$ for katex - block
          .replace(/\\[(]/g, "$") // replace \( with $ for katex - inline
          .replace(/\\[)]/g, "$") // replace \) with $ for katex - inline
      }
    </ReactMarkdown>
  );
}

export default MarkdownRenderer;
