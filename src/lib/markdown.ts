import { marked, type Tokens } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Renders Markdown to safe, sanitized HTML.
 *
 * - GitHub-flavored Markdown (tables, task lists, autolinks, strikethrough)
 * - Code blocks are emitted as <pre data-lang="…"><code>…</code></pre> so the
 *   client renderer can highlight them with Shiki after mount.
 * - ```mermaid fences are emitted as <div class="mermaid-block" data-mermaid>
 *   so the client renderer can render them as diagrams.
 *
 * Always sanitized with DOMPurify — Markdown can embed raw HTML (XSS vector).
 */

const renderer = new marked.Renderer();

// Custom code renderer: keep the raw source in a data attribute (base64 to
// survive sanitization untouched) so the client can highlight/diagram it.
renderer.code = ({ text, lang }: Tokens.Code): string => {
	const language = (lang ?? '').trim().toLowerCase();
	const encoded = encodeBase64(text);

	if (language === 'mermaid') {
		return `<div class="mermaid-block" data-mermaid="${encoded}"></div>`;
	}

	// Escaped fallback shown before/without highlighting.
	const escaped = escapeHtml(text);
	return `<pre data-lang="${language}" data-code="${encoded}"><code>${escaped}</code></pre>`;
};

marked.setOptions({ gfm: true, breaks: true, renderer });

function escapeHtml(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function encodeBase64(input: string): string {
	// Works in both Node and browser.
	if (typeof Buffer !== 'undefined') return Buffer.from(input, 'utf-8').toString('base64');
	return btoa(unescape(encodeURIComponent(input)));
}

export function decodeBase64(input: string): string {
	if (typeof Buffer !== 'undefined') return Buffer.from(input, 'base64').toString('utf-8');
	return decodeURIComponent(escape(atob(input)));
}

export function renderMarkdown(source: string): string {
	const rawHtml = marked.parse(source ?? '', { async: false }) as string;
	return DOMPurify.sanitize(rawHtml, {
		USE_PROFILES: { html: true },
		// Allow the data-* attributes our client post-processor relies on.
		ADD_ATTR: ['target', 'rel', 'data-lang', 'data-code', 'data-mermaid', 'data-checked'],
		ADD_TAGS: ['input']
	});
}
