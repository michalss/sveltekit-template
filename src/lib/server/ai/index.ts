import { env } from '$env/dynamic/private';
import { createOpenAiCompatibleProvider } from './openai-compatible';
import { createGeminiProvider } from './gemini';
import type { AiProvider, AiProviderId } from './types';

export type { AiMessage, AiProvider, AiProviderId, AiCompletionOptions } from './types';

/**
 * Central AI provider registry.
 *
 * Providers are created lazily and only when their API key is present, so the
 * template runs without any AI keys configured. Add a new provider by writing
 * one factory and registering it here.
 */
const factories: Record<AiProviderId, () => AiProvider | null> = {
	openai: () =>
		env.OPENAI_API_KEY
			? createOpenAiCompatibleProvider({
					id: 'openai',
					apiKey: env.OPENAI_API_KEY,
					defaultModel: env.OPENAI_MODEL || 'gpt-4o-mini'
				})
			: null,

	deepseek: () =>
		env.DEEPSEEK_API_KEY
			? createOpenAiCompatibleProvider({
					id: 'deepseek',
					apiKey: env.DEEPSEEK_API_KEY,
					baseURL: 'https://api.deepseek.com',
					defaultModel: env.DEEPSEEK_MODEL || 'deepseek-chat'
				})
			: null,

	gemini: () =>
		env.GEMINI_API_KEY
			? createGeminiProvider({
					apiKey: env.GEMINI_API_KEY,
					defaultModel: env.GEMINI_MODEL || 'gemini-1.5-flash'
				})
			: null
};

const cache = new Map<AiProviderId, AiProvider>();

/** Returns the provider, or throws a clear error if its key is missing. */
export function getAiProvider(id: AiProviderId): AiProvider {
	const cached = cache.get(id);
	if (cached) return cached;

	const provider = factories[id]?.();
	if (!provider) {
		throw new Error(
			`AI provider "${id}" is not configured. Set the matching API key in your environment.`
		);
	}

	cache.set(id, provider);
	return provider;
}

/** The default provider, controlled by AI_DEFAULT_PROVIDER (falls back to openai). */
export function getDefaultAiProvider(): AiProvider {
	const id = (env.AI_DEFAULT_PROVIDER as AiProviderId) || 'openai';
	return getAiProvider(id);
}

/** Lists which providers currently have credentials configured. */
export function availableAiProviders(): AiProviderId[] {
	return (Object.keys(factories) as AiProviderId[]).filter((id) => factories[id]() !== null);
}
