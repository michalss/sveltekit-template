/**
 * Uploads an image file to the server and returns its public URL.
 * Shared by the Markdown editor (button, paste, drag & drop).
 */
export async function uploadImage(file: File): Promise<string> {
	const body = new FormData();
	body.append('file', file);

	const res = await fetch('/api/upload', { method: 'POST', body });
	if (!res.ok) {
		// Map common statuses to friendly messages instead of raw JSON/text.
		if (res.status === 401) {
			throw new Error('You must be signed in to upload images.');
		}
		if (res.status === 413) throw new Error('Image is too large (max 5 MB).');
		if (res.status === 415) throw new Error('Unsupported image type.');
		if (res.status === 429) throw new Error('Too many uploads — please slow down.');

		// Try to extract a server message, but never surface raw JSON to the user.
		let message = `Upload failed (${res.status}).`;
		const text = await res.text().catch(() => '');
		try {
			const parsed = JSON.parse(text);
			if (parsed?.message) message = parsed.message;
		} catch {
			if (text && !text.startsWith('{')) message = text;
		}
		throw new Error(message);
	}

	const data = (await res.json()) as { url: string };
	return data.url;
}
