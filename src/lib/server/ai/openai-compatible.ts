import OpenAI from 'openai';
import type { AiCompletionOptions, AiMessage, AiProvider } from './types';

interface OpenAiCompatibleConfig {
	id: string;
	apiKey: string;
	baseURL?: string;
	defaultModel: string;
}

/**
 * Factory for any OpenAI-compatible chat API.
 *
 * Used for both OpenAI itself and DeepSeek (which exposes an OpenAI-compatible
 * endpoint), so we don't duplicate the request/stream plumbing.
 */
export function createOpenAiCompatibleProvider(config: OpenAiCompatibleConfig): AiProvider {
	const client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL });

	return {
		id: config.id,
		defaultModel: config.defaultModel,

		async complete(messages: AiMessage[], options?: AiCompletionOptions) {
			const res = await client.chat.completions.create(
				{
					model: options?.model ?? config.defaultModel,
					temperature: options?.temperature,
					max_tokens: options?.maxTokens,
					messages
				},
				{ signal: options?.signal }
			);
			return res.choices[0]?.message?.content ?? '';
		},

		async *stream(messages: AiMessage[], options?: AiCompletionOptions) {
			const res = await client.chat.completions.create(
				{
					model: options?.model ?? config.defaultModel,
					temperature: options?.temperature,
					max_tokens: options?.maxTokens,
					stream: true,
					messages
				},
				{ signal: options?.signal }
			);
			for await (const chunk of res) {
				const delta = chunk.choices[0]?.delta?.content;
				if (delta) yield delta;
			}
		}
	};
}
