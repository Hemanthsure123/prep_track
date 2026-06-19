import "server-only";

import rehypeShiki from "@shikijs/rehype";
import rehypeSanitize, { defaultSchema, type Options as SanitizeOptions } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { cn } from "@/lib/utils";

const sanitizeSchema: SanitizeOptions = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      ["className", /^language-/],
    ],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      "style",
      ["className", /^line$/],
    ],
    pre: [
      ...(defaultSchema.attributes?.pre ?? []),
      "style",
      ["className", /^shiki/],
      ["data-language", /.*/],
      ["data-theme", /.*/],
    ],
  },
  tagNames: [...(defaultSchema.tagNames ?? []), "span"],
};

async function compile(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeShiki, {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: "light",
    })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

async function compilePlain(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function MarkdownRenderer({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content || content.trim().length === 0) return null;

  let html: string;
  try {
    html = await compile(content);
  } catch {
    try {
      html = await compilePlain(content);
    } catch {
      html = `<pre class="whitespace-pre-wrap">${escapeHtml(content)}</pre>`;
    }
  }

  return (
    <div
      className={cn(
        "prose prose-slate dark:prose-invert max-w-none text-sm",
        "prose-pre:rounded-md prose-pre:border prose-pre:bg-muted prose-pre:p-3",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Lightweight Markdown renderer WITHOUT Shiki syntax highlighting.
 * Use for high-volume lists (e.g. the topic-area question explorer) where the
 * per-item Shiki cost (and its multi-second cold start) would dominate latency.
 */
export async function MarkdownRendererPlain({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content || content.trim().length === 0) return null;

  let html: string;
  try {
    html = await compilePlain(content);
  } catch {
    html = `<pre class="whitespace-pre-wrap">${escapeHtml(content)}</pre>`;
  }

  return (
    <div
      className={cn(
        "prose prose-slate dark:prose-invert max-w-none text-sm",
        "prose-pre:rounded-md prose-pre:border prose-pre:bg-muted prose-pre:p-3",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
