import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AiCompletionOptions, AiMessage, AiProvider } from './types';

interface GeminiConfig {
	apiKey: string;
	defaultModel: string;
}

/** Maps our role-based messages onto Gemini's content/history format. */
function toGemini(messages: AiMessage[]) {
	const system = messages
		.filter((m) => m.role === 'system')
		.map((m) => m.content)
		.join('\n\n');

	const history = messages
		.filter((m) => m.role !== 'system')
		.map((m) => ({
			role: m.role === 'assistant' ? 'model' : 'user',
			parts: [{ text: m.content }]
		}));

	return { system: system || undefined, history };
}

export function createGeminiProvider(config: GeminiConfig): AiProvider {
	const genAI = new GoogleGenerativeAI(config.apiKey);

	function getModel(modelName: string, systemInstruction?: string) {
		return genAI.getGenerativeModel({ model: modelName, systemInstruction });
	}

	return {
		id: 'gemini',
		defaultModel: config.defaultModel,

		async complete(messages: AiMessage[], options?: AiCompletionOptions) {
			const { system, history } = toGemini(messages);
			const model = getModel(options?.model ?? config.defaultModel, system);
			const result = await model.generateContent({
				contents: history,
				generationConfig: {
					temperature: options?.temperature,
					maxOutputTokens: options?.maxTokens
				}
			});
			return result.response.text();
		},

		async *stream(messages: AiMessage[], options?: AiCompletionOptions) {
			const { system, history } = toGemini(messages);
			const model = getModel(options?.model ?? config.defaultModel, system);
			const result = await model.generateContentStream({
				contents: history,
				generationConfig: {
					temperature: options?.temperature,
					maxOutputTokens: options?.maxTokens
				}
			});
			for await (const chunk of result.stream) {
				const text = chunk.text();
				if (text) yield text;
			}
		}
	};
}
