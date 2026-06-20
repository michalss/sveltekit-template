import Anthropic from '@anthropic-ai/sdk';
import type { AiCompletionOptions, AiMessage, AiProvider } from './types';

interface AnthropicConfig {
	apiKey: string;
	defaultModel: string;
}

const DEFAULT_MAX_TOKENS = 4096;

/**
 * Splits our role-based messages into Anthropic's (system, messages) shape.
 * Anthropic takes the system prompt as a top-level field, not a message.
 */
function toAnthropic(messages: AiMessage[]) {
	const system = messages
		.filter((m) => m.role === 'system')
		.map((m) => m.content)
		.join('\n\n');

	const turns = messages
		.filter((m) => m.role !== 'system')
		.map((m) => ({
			role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
			content: m.content
		}));

	return { system: system || undefined, turns };
}

export function createAnthropicProvider(config: AnthropicConfig): AiProvider {
	const client = new Anthropic({ apiKey: config.apiKey });

	return {
		id: 'anthropic',
		defaultModel: config.defaultModel,

		async complete(messages: AiMessage[], options?: AiCompletionOptions) {
			const { system, turns } = toAnthropic(messages);
			const res = await client.messages.create(
				{
					model: options?.model ?? config.defaultModel,
					max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
					system,
					messages: turns
				},
				{ signal: options?.signal }
			);
			return res.content
				.filter((block): block is Anthropic.TextBlock => block.type === 'text')
				.map((block) => block.text)
				.join('');
		},

		async *stream(messages: AiMessage[], options?: AiCompletionOptions) {
			const { system, turns } = toAnthropic(messages);
			const stream = client.messages.stream(
				{
					model: options?.model ?? config.defaultModel,
					max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
					system,
					messages: turns
				},
				{ signal: options?.signal }
			);
			for await (const event of stream) {
				if (
					event.type === 'content_block_delta' &&
					event.delta.type === 'text_delta'
				) {
					yield event.delta.text;
				}
			}
		}
	};
}
