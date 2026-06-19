import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Renders Markdown to safe, sanitized HTML.
 *
 * Works on both server (SSR) and client thanks to isomorphic-dompurify, so the
 * same function backs `MarkdownRenderer` everywhere. Always sanitize — Markdown
 * can contain raw HTML, which is an XSS vector if rendered with {@html} as-is.
 */
marked.setOptions({
	gfm: true,
	breaks: true
});

export function renderMarkdown(source: string): string {
	const rawHtml = marked.parse(source ?? '', { async: false }) as string;
	return DOMPurify.sanitize(rawHtml, {
		USE_PROFILES: { html: true },
		ADD_ATTR: ['target', 'rel']
	});
}
