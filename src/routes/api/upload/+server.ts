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
const ALLOWED = new Map<string, string>([
	['image/png', 'png'],
	['image/jpeg', 'jpg'],
	['image/gif', 'gif'],
	['image/webp', 'webp'],
	['image/svg+xml', 'svg']
]);

const UPLOAD_DIR = join('static', 'uploads');

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

	const ext = ALLOWED.get(file.type);
	if (!ext) {
		throw error(415, 'Unsupported file type');
	}
	if (file.size > MAX_BYTES) {
		throw error(413, 'File too large (max 5 MB)');
	}

	const name = `${randomUUID()}.${ext}`;
	const bytes = new Uint8Array(await file.arrayBuffer());

	await mkdir(UPLOAD_DIR, { recursive: true });
	await writeFile(join(UPLOAD_DIR, name), bytes);

	const url = `/uploads/${name}`;
	return json({ url, name, size: file.size, type: file.type });
};
