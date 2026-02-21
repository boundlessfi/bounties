"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function DescriptionCard({ description }: { description: string }) {
  return (
    <div className="p-6 rounded-xl border border-gray-800 bg-background-card backdrop-blur-xl shadow-sm">
      <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-5">
        Description
      </h2>
      <div
        className="prose prose-invert prose-sm max-w-none
        prose-headings:font-bold prose-headings:text-gray-100
        prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
        prose-p:text-gray-300 prose-p:leading-relaxed
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-100
        prose-li:text-gray-300
        prose-blockquote:border-primary/40 prose-blockquote:text-gray-400
        prose-hr:border-gray-800
        prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-xl
        prose-th:text-gray-300 prose-th:bg-gray-900/60
        prose-td:border-gray-800 prose-table:text-sm"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
      </div>
    </div>
  );
}
