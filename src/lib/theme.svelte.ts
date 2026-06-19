import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

function readStored(): Theme {
	if (!browser) return 'system';
	const value = localStorage.getItem(STORAGE_KEY);
	return value === 'light' || value === 'dark' ? value : 'system';
}

function systemPrefersDark(): boolean {
	return browser && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

class ThemeStore {
	/** The user's chosen preference. */
	preference = $state<Theme>(readStored());

	/** The effective theme actually applied to the document. */
	resolved = $derived<'light' | 'dark'>(
		this.preference === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : this.preference
	);

	constructor() {
		if (!browser) return;

		// Keep <html>.dark and storage in sync with the preference.
		$effect.root(() => {
			$effect(() => {
				document.documentElement.classList.toggle('dark', this.resolved === 'dark');
				if (this.preference === 'system') {
					localStorage.removeItem(STORAGE_KEY);
				} else {
					localStorage.setItem(STORAGE_KEY, this.preference);
				}
			});
		});

		// React to OS changes while on "system".
		window
			.matchMedia('(prefers-color-scheme: dark)')
			.addEventListener('change', () => {
				if (this.preference === 'system') {
					document.documentElement.classList.toggle('dark', systemPrefersDark());
				}
			});
	}

	set(theme: Theme) {
		this.preference = theme;
	}

	/** Quick light/dark toggle (collapses "system" to its opposite). */
	toggle() {
		this.preference = this.resolved === 'dark' ? 'light' : 'dark';
	}
}

export const theme = new ThemeStore();
