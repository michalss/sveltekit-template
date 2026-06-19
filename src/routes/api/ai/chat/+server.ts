import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { getAiProvider, getDefaultAiProvider } from '$lib/server/ai';
import type { AiProviderId } from '$lib/server/ai';
import type { RequestHandler } from './$types';

const bodySchema = z.object({
	provider: z.enum(['openai', 'gemini', 'deepseek']).optional(),
	model: z.string().optional(),
	stream: z.boolean().optional().default(true),
	messages: z
		.array(
			z.object({
				role: z.enum(['system', 'user', 'assistant']),
				content: z.string()
			})
		)
		.min(1)
});

export const POST: RequestHandler = async ({ request, locals }) => {
	// Require an authenticated user to use the AI endpoint.
	if (!locals.user) {
		throw error(401, 'Unauthorized');
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
