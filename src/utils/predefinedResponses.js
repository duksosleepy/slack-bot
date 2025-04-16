/**
 * Utility for handling predefined responses to common queries
 */

// Map of predefined responses - key: regex pattern, value: response object
const PREDEFINED_RESPONSES = new Map([
	// Help request patterns
	[
		/\b(help|assistance|guide|tutorial|how to|what can you do)\b/i,
		{
			answer:
				"I can help you with a variety of tasks! Here are some things you can do:\n\n" +
				"• Ask me questions using `/claude`, `/chatgpt`, or `/gemini` commands\n" +
				"• Just mention me with your question in any channel\n" +
				"• Send me a direct message with your query\n" +
				"• Type `use claude`, `use chatgpt`, or `use gemini` to set your preferred AI model\n" +
				"• Use `/help` to see available commands\n\n" +
				"Is there anything specific you'd like help with?",
			message_id: "predefined_help_response",
		},
	],

	// Greeting patterns
	[
		/\b(hello|hi|hey|howdy|greetings|good morning|good afternoon|good evening)\b/i,
		{
			answer: "Hello there! How can I assist you today?",
			message_id: "predefined_greeting_response",
		},
	],

	// Thank you patterns
	[
		/\b(thanks|thank you|thx|appreciate it|grateful)\b/i,
		{
			answer:
				"You're welcome! I'm happy to help. Is there anything else you need?",
			message_id: "predefined_thanks_response",
		},
	],

	// About bot pattern
	[
		/\b(who are you|what are you|about you|about yourself|tell me about you)\b/i,
		{
			answer:
				"I'm a Slack bot designed to help you access AI models like Claude, ChatGPT, and Gemini directly from Slack! I can answer questions, provide information, and assist with various tasks. You can interact with me by mentioning me in a channel, sending me a direct message, or using slash commands like `/claude`, `/chatgpt`, or `/gemini`.",
			message_id: "predefined_about_response",
		},
	],

	// Model selection info
	[
		/\b(which model|what models|available models|ai models|switch model)\b/i,
		{
			answer:
				"I support multiple AI models:\n\n" +
				"• **Claude** - Anthropic's conversational AI\n" +
				"• **ChatGPT** - OpenAI's language model\n" +
				"• **Gemini** - Google's multimodal AI\n\n" +
				"You can select your preferred model by typing `use claude`, `use chatgpt`, or `use gemini`. Alternatively, you can use the dedicated slash commands: `/claude`, `/chatgpt`, or `/gemini` followed by your question.",
			message_id: "predefined_models_response",
		},
	],
]);

/**
 * Check if a message matches any predefined response patterns
 * @param {string} message - The message to check
 * @returns {Object|null} - The predefined response object or null if no match
 */
function findPredefinedResponse(message) {
	if (!message || typeof message !== "string") {
		return null;
	}

	// Convert message to lowercase for case-insensitive matching
	const normalizedMessage = message.trim();

	// Check each pattern for a match
	for (const [pattern, response] of PREDEFINED_RESPONSES.entries()) {
		if (pattern.test(normalizedMessage)) {
			// Return a copy of the response to prevent modification
			return { ...response };
		}
	}

	// No match found
	return null;
}

/**
 * Add a new predefined response pattern
 * @param {RegExp} pattern - The regex pattern to match
 * @param {Object} response - The response object with answer and message_id
 */
function addPredefinedResponse(pattern, response) {
	if (!(pattern instanceof RegExp) || !response || !response.answer) {
		throw new Error("Invalid pattern or response");
	}

	PREDEFINED_RESPONSES.set(pattern, response);
}

module.exports = {
	findPredefinedResponse,
	addPredefinedResponse,
};
