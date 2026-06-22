import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { getAiProvider, getDefaultAiProvider } from '$lib/server/ai';
import type { AiProviderId } from '$lib/server/ai';
import { rateLimit, retryAfterSeconds } from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

const MAX_CONTENT = 16_000; // chars per message
const MAX_MESSAGES = 50;

const bodySchema = z.object({
	provider: z.enum(['openai', 'gemini', 'deepseek', 'anthropic']).optional(),
	model: z.string().max(100).optional(),
	stream: z.boolean().optional().default(true),
	// Only user/assistant turns are accepted from the client. A client-supplied
	// `system` role would let any user override the app's system prompt / jailbreak
	// the model on the app's API key — prepend system prompts server-side instead.
	messages: z
		.array(
			z.object({
				role: z.enum(['user', 'assistant']),
				content: z.string().min(1).max(MAX_CONTENT)
			})
		)
		.min(1)
		.max(MAX_MESSAGES)
});

export const POST: RequestHandler = async ({ request, locals }) => {
	// Require an authenticated user to use the AI endpoint.
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// Per-user rate limit to prevent runaway cost / abuse.
	const limit = rateLimit({ key: `ai:${locals.user.id}`, limit: 20, windowMs: 60_000 });
	if (!limit.success) {
		throw error(429, `Rate limit exceeded. Try again in ${retryAfterSeconds(limit.resetAt)}s.`);
	}

	// Reject oversized bodies before parsing JSON.
	const contentLength = Number(request.headers.get('content-length') ?? 0);
	if (contentLength > 1_000_000) {
		throw error(413, 'Payload too large');
	}

	const parsed = bodySchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) {
		throw error(400, 'Invalid request body');
	}

	const { provider, model, messages, stream } = parsed.data;
	const ai = provider ? getAiProvider(provider as AiProviderId) : getDefaultAiProvider();

	if (!stream) {
		const text = await ai.complete(messages, { model });
		return json({ provider: ai.id, model: model ?? ai.defaultModel, text });
	}

	const encoder = new TextEncoder();
	const readable = new ReadableStream<Uint8Array>({
		async start(controller) {
			try {
				for await (const delta of ai.stream(messages, { model, signal: request.signal })) {
					controller.enqueue(encoder.encode(delta));
				}
			} catch (e) {
				controller.error(e);
				return;
			}
			controller.close();
		}
	});

	return new Response(readable, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-cache'
		}
	});
};
