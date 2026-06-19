import { createHighlighter, type Highlighter } from 'shiki';

/**
 * Lazily-created shared Shiki highlighter.
 *
 * Loads a small set of common languages and both light/dark themes. Extend the
 * `langs`/`themes` arrays as needed. Cached so it's created at most once.
 */
let highlighterPromise: Promise<Highlighter> | null = null;

const THEMES = { light: 'github-light', dark: 'github-dark' } as const;

const LANGS = [
	'ts',
	'js',
	'tsx',
	'jsx',
	'svelte',
	'html',
	'css',
	'json',
	'bash',
	'shell',
	'sql',
	'md',
	'python',
	'yaml'
];

function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: [THEMES.light, THEMES.dark],
			langs: LANGS
		});
	}
	return highlighterPromise;
}

/** Highlights code to HTML with light/dark themes (driven by CSS vars). */
export async function highlightCode(code: string, lang: string): Promise<string> {
	const highlighter = await getHighlighter();
	const loaded = highlighter.getLoadedLanguages();
	const language = loaded.includes(lang as never) ? lang : 'text';

	return highlighter.codeToHtml(code, {
		lang: language,
		themes: THEMES,
		defaultColor: false // emit CSS vars for both themes
	});
}
