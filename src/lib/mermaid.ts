import type { MermaidConfig } from 'mermaid';

/**
 * Client-only Mermaid loader.
 *
 * Mermaid touches the DOM, so it is imported dynamically and only in the
 * browser. Returns a `render` function that produces SVG for a diagram.
 */
let initialized = false;

export async function renderMermaid(id: string, definition: string, dark: boolean): Promise<string> {
	const { default: mermaid } = await import('mermaid');

	const config: MermaidConfig = {
		startOnLoad: false,
		securityLevel: 'strict', // sanitize labels; no click handlers
		theme: dark ? 'dark' : 'default'
	};

	// Re-init when theme changes so colors track light/dark.
	mermaid.initialize(config);
	initialized = true;

	const { svg } = await mermaid.render(id, definition);
	return svg;
}

export function isMermaidReady(): boolean {
	return initialized;
}
