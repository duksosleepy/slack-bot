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

		// Build request payload
		const payload = {
			inputs: inputs,
			query: query,
			response_mode: stream ? "streaming" : "blocking",
			user: userId,
			files: files,
		};

		// Debug log for request
		console.log(`[DIFY API] Request to chat-messages endpoint:
URL: https://api.dify.ai/v1/chat-messages
Method: POST
User: ${userId}
Model: ${model || "default"}
Query length: ${query.length} characters
Response mode: ${stream ? "streaming" : "blocking"}
Has files: ${files ? "yes" : "no"}`);

		console.log(
			`[DIFY API] Full request payload: ${JSON.stringify(payload, null, 2)}`,
		);

		// Track request timing
		const startTime = Date.now();

		// Make direct API call to Dify
		const response = await fetch("https://api.dify.ai/v1/chat-messages", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${config.dify.apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		// Calculate time taken
		const timeElapsed = Date.now() - startTime;

		// Debug log for response status
		console.log(`[DIFY API] Response received in ${timeElapsed}ms:
Status: ${response.status} ${response.statusText}
Content-Type: ${response.headers.get("content-type")}
Content-Length: ${response.headers.get("content-length") || "unknown"}`);

		// Parse response
		const responseData = await response.json();

		// Log response summary (not the full response to avoid console clutter)
		if (responseData.answer) {
			console.log(
				`[DIFY API] Response contains answer of ${responseData.answer.length} characters`,
			);
		} else {
			console.log("[DIFY API] Response does not contain an answer field");
			console.log(
				`[DIFY API] Response keys: ${Object.keys(responseData).join(", ")}`,
			);
		}

		if (responseData.error) {
			console.error(`[DIFY API] Error returned: ${responseData.error}`);
		}

		return responseData;
	} catch (error) {
		console.error("[DIFY API] Error sending chat message to Dify:", error);
		console.error(`[DIFY API] Error details: ${error.message}`);
		console.error(`[DIFY API] Error stack: ${error.stack}`);
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

		console.log(`[DIFY API] Sending completion request:
User: ${userId}
Model: ${model || "default"}
Query length: ${query.length} characters`);

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

		const responseData = await response.json();

		// Log response summary
		console.log(`[DIFY API] Completion response received:
Status: ${response.status}
Has answer: ${responseData.answer ? "yes" : "no"}`);

		return responseData;
	} catch (error) {
		console.error(
			"[DIFY API] Error sending completion message to Dify:",
			error,
		);
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
		console.log(`[DIFY API] Getting conversations for user: ${userId}`);

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

		const data = await response.json();
		console.log(
			`[DIFY API] Retrieved ${data.data ? data.data.length : 0} conversations`,
		);

		return data;
	} catch (error) {
		console.error("[DIFY API] Error getting conversations from Dify:", error);
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
		console.log(
			`[DIFY API] Getting messages for conversation: ${conversationId}, user: ${userId}`,
		);

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

		const data = await response.json();
		console.log(
			`[DIFY API] Retrieved ${data.data ? data.data.length : 0} messages`,
		);

		return data;
	} catch (error) {
		console.error(
			"[DIFY API] Error getting conversation messages from Dify:",
			error,
		);
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
			`[DIFY API] Providing feedback for message ${messageId}, rating: ${rating}, user: ${userId}`,
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
				`[DIFY API] Feedback API error: ${response.status} ${response.statusText}`,
			);
			const text = await response.text();
			console.error(`[DIFY API] Response body: ${text.substring(0, 200)}...`);
			throw new Error(`API error: ${response.status}`);
		}

		console.log("[DIFY API] Feedback submitted successfully");

		// Only try to parse JSON if we have a success response
		return await response.json();
	} catch (error) {
		console.error("[DIFY API] Error providing feedback to Dify:", error);
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

	console.log(`[DIFY FORMAT] Formatting response for Slack:
Model: ${model || "default"}
Answer length: ${answerText.length} characters
Has metadata: ${difyResponse.metadata ? "yes" : "no"}`);

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

		console.log(`[DIFY FORMAT] Added usage info:
Total tokens: ${usage.total_tokens}
Prompt tokens: ${usage.prompt_tokens}
Completion tokens: ${usage.completion_tokens}
Latency: ${Math.round(usage.latency * 1000)}ms`);
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

	console.log(`[DIFY FORMAT] Created response with ${blocks.length} blocks`);

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
