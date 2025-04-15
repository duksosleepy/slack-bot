/**
 * Utility functions for interacting with the Dify API
 */
const config = require("../config");

// Define available models
const AVAILABLE_MODELS = {
	claude: "claude",
	chatgpt: "chatgpt",
	gemini: "gemini",
};

/**
 * Send a chat message to Dify and get a response
 * @param {string} query - The user's message
 * @param {string} userId - The user's ID
 * @param {string} model - The AI model to use (e.g., 'claude', 'chatgpt', 'gemini')
 * @param {boolean} stream - Whether to use streaming mode
 * @param {Array} files - Optional array of files to send
 * @returns {Promise} - Promise with the response
 */
async function sendChatMessage(
	query,
	userId,
	model = null,
	stream = false,
	files = null,
) {
	try {
		// Create inputs object with model if specified
		const inputs = model ? { model: model } : {};

		// Make direct API call to Dify
		const response = await fetch("https://api.dify.ai/v1/chat-messages", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${config.dify.apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				inputs: inputs,
				query: query,
				response_mode: stream ? "streaming" : "blocking",
				user: userId,
				files: files,
			}),
		});

		return await response.json();
	} catch (error) {
		console.error("Error sending chat message to Dify:", error);
		throw error;
	}
}

/**
 * Send a completion message to Dify and get a response
 * @param {string} query - The user's message
 * @param {string} userId - The user's ID
 * @param {string} model - The AI model to use
 * @param {Array} files - Optional array of files to send
 * @returns {Promise} - Promise with the response
 */
async function sendCompletionMessage(
	query,
	userId,
	model = null,
	files = null,
) {
	try {
		// Create inputs object with model if specified
		const inputs = model ? { model: model } : {};

		// Make direct API call to Dify
		const response = await fetch("https://api.dify.ai/v1/completion-messages", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${config.dify.apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				inputs: inputs,
				query: query,
				user: userId,
				files: files,
			}),
		});

		return await response.json();
	} catch (error) {
		console.error("Error sending completion message to Dify:", error);
		throw error;
	}
}

/**
 * Get conversations for a user
 * @param {string} userId - The user's ID
 * @returns {Promise} - Promise with the conversations
 */
async function getConversations(userId) {
	try {
		const response = await fetch(
			`https://api.dify.ai/v1/conversations?user=${userId}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${config.dify.apiKey}`,
					"Content-Type": "application/json",
				},
			},
		);

		return await response.json();
	} catch (error) {
		console.error("Error getting conversations from Dify:", error);
		throw error;
	}
}

/**
 * Get messages for a conversation
 * @param {string} conversationId - The conversation ID
 * @param {string} userId - The user's ID
 * @returns {Promise} - Promise with the messages
 */
async function getConversationMessages(conversationId, userId) {
	try {
		const response = await fetch(
			`https://api.dify.ai/v1/messages?conversation_id=${conversationId}&user=${userId}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${config.dify.apiKey}`,
					"Content-Type": "application/json",
				},
			},
		);

		return await response.json();
	} catch (error) {
		console.error("Error getting conversation messages from Dify:", error);
		throw error;
	}
}

/**
 * Provide feedback for a message
 * @param {string} messageId - The message ID
 * @param {number} rating - The rating (1 for positive, 0 for negative)
 * @param {string} userId - The user's ID
 * @returns {Promise} - Promise with the feedback result
 */
async function provideFeedback(messageId, rating, userId) {
	try {
		console.log(
			`Providing feedback for message ${messageId}, rating: ${rating}, user: ${userId}`,
		);

		const response = await fetch("https://api.dify.ai/v1/message-feedbacks", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${config.dify.apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				message_id: messageId,
				rating: rating,
				user: userId,
			}),
		});

		// Check if the response is OK
		if (!response.ok) {
			console.error(
				`Feedback API error: ${response.status} ${response.statusText}`,
			);
			const text = await response.text();
			console.error(`Response body: ${text.substring(0, 200)}...`);
			throw new Error(`API error: ${response.status}`);
		}

		// Only try to parse JSON if we have a success response
		return await response.json();
	} catch (error) {
		console.error("Error providing feedback to Dify:", error);
		// Don't throw the error, just log it
		return { success: false, error: error.message };
	}
}

/**
 * Process Dify response and format for Slack
 * @param {Object} difyResponse - The response from Dify
 * @param {Object} blockKit - The Block Kit utilities
 * @param {string} model - The AI model used (optional)
 * @returns {Object} - Formatted response for Slack
 */
function formatDifyResponse(difyResponse, blockKit, model = null) {
	const { section, divider, actions, button } = blockKit;

	// Get answer text or default message
	const answerText = difyResponse.answer || "No response from Dify";

	// Create blocks array
	const blocks = [];

	// Add model info if available
	if (model) {
		blocks.push(section(`*Model:* ${model.toUpperCase()}`), divider());
	}

	// Add the answer
	blocks.push(section(answerText));

	// Add usage information if available
	if (difyResponse.metadata?.usage) {
		const usage = difyResponse.metadata.usage;
		blocks.push(
			divider(),
			section(
				`*Usage:* ${usage.total_tokens} tokens (${usage.prompt_tokens} prompt + ${usage.completion_tokens} completion)`,
			),
			section(`*Latency:* ${Math.round(usage.latency * 1000)}ms`),
		);
	}

	// Add feedback buttons
	blocks.push(
		divider(),
		actions([
			button(
				"👍 Helpful",
				"dify_feedback_positive",
				difyResponse.message_id,
				"primary",
			),
			button(
				"👎 Not Helpful",
				"dify_feedback_negative",
				difyResponse.message_id,
				"danger",
			),
		]),
	);

	return {
		text: answerText,
		blocks: blocks,
	};
}

module.exports = {
	sendChatMessage,
	sendCompletionMessage,
	getConversations,
	getConversationMessages,
	provideFeedback,
	formatDifyResponse,
	AVAILABLE_MODELS,
};
