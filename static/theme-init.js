// Anti-FOUC: apply the stored/system theme before first paint.
// Kept as an external file (served under script-src 'self') so the CSP does not
// need 'unsafe-inline' for scripts.
(() => {
	try {
		const stored = localStorage.getItem('theme');
		const dark =
			stored === 'dark' ||
			(!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
		document.documentElement.classList.toggle('dark', dark);
	} catch {
		/* ignore */
	}
})();
