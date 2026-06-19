/** Shared types for the AI provider abstraction. */

export type AiRole = 'system' | 'user' | 'assistant';

export interface AiMessage {
	role: AiRole;
	content: string;
}

export interface AiCompletionOptions {
	model?: string;
	temperature?: number;
	maxTokens?: number;
	signal?: AbortSignal;
}

export interface AiProvider {
	readonly id: string;
	readonly defaultModel: string;
	/** Single-shot completion, returns the full text. */
	complete(messages: AiMessage[], options?: AiCompletionOptions): Promise<string>;
	/** Streaming completion, yields text deltas. */
	stream(messages: AiMessage[], options?: AiCompletionOptions): AsyncIterable<string>;
}

export type AiProviderId = 'openai' | 'gemini' | 'deepseek';
