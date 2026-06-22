import { json, error } from '@sveltejs/kit';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { rateLimit, retryAfterSeconds } from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

/**
 * Image upload endpoint.
 *
 * Stores files under static/uploads and returns their public URL. Auth-only,
 * with type + size validation and rate limiting. For production you'd typically
 * swap the local disk write for S3/R2 — the validation logic stays the same.
 */

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Allowed raster image types. SVG is deliberately excluded: it is XML that can
// carry <script>/onload handlers and, served same-origin, becomes stored XSS.
const ALLOWED = new Map<string, string>([
	['image/png', 'png'],
	['image/jpeg', 'jpg'],
	['image/gif', 'gif'],
	['image/webp', 'webp']
]);

const UPLOAD_DIR = join('static', 'uploads');

/**
 * Detects the real image type from the file's magic bytes. The client-supplied
 * MIME (file.type) is spoofable, so we never trust it — the stored extension and
 * served content-type are derived from the actual bytes here.
 * Returns the canonical extension, or null if the bytes are not an allowed image.
 */
function sniffImageExt(bytes: Uint8Array): string | null {
	const b = bytes;
	// PNG: 89 50 4E 47 0D 0A 1A 0A
	if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
	// JPEG: FF D8 FF
	if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
	// GIF: "GIF87a" / "GIF89a"
	if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'gif';
	// WEBP: "RIFF"...."WEBP"
	if (
		b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
		b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
	) {
		return 'webp';
	}
	return null;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const limit = rateLimit({ key: `upload:${locals.user.id}`, limit: 30, windowMs: 60_000 });
	if (!limit.success) {
		throw error(429, `Too many uploads. Try again in ${retryAfterSeconds(limit.resetAt)}s.`);
	}

	const form = await request.formData().catch(() => null);
	const file = form?.get('file');
	if (!(file instanceof File)) {
		throw error(400, 'No file provided');
	}

	// Reject by declared type early (cheap), but the real check is the byte sniff.
	if (!ALLOWED.has(file.type)) {
		throw error(415, 'Unsupported file type');
	}
	if (file.size > MAX_BYTES) {
		throw error(413, 'File too large (max 5 MB)');
	}

	const bytes = new Uint8Array(await file.arrayBuffer());

	// Derive the extension from the actual bytes, not the spoofable client MIME.
	const ext = sniffImageExt(bytes);
	if (!ext) {
		throw error(415, 'Unsupported file type');
	}

	const name = `${randomUUID()}.${ext}`;

	await mkdir(UPLOAD_DIR, { recursive: true });
	await writeFile(join(UPLOAD_DIR, name), bytes);

	const url = `/uploads/${name}`;
	return json({ url, name, size: file.size, type: file.type });
};
