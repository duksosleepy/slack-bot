// Message handlers for Slack messages
const difyService = require("../utils/difyService");
const blockKit = require("../utils/blockKit");
const predefinedResponses = require("../utils/predefinedResponses");

// Track handled message IDs to prevent duplicate processing
const handledMessages = new Set();

// Store user model preferences - key: userId, value: model name
const userModelPreferences = new Map();

// Clean up old handled messages (keep only recent ones)
setInterval(() => {
	// Keep only 100 most recent messages
	if (handledMessages.size > 100) {
		const toRemove = handledMessages.size - 100;
		const iterator = handledMessages.values();
		for (let i = 0; i < toRemove; i++) {
			handledMessages.delete(iterator.next().value);
		}
	}

	// Clean up user model preferences for inactive users (keep for max 24 hours)
	// Only run this cleanup occasionally (every 10 minutes)
	if (Math.random() < 0.1) {
		const now = Date.now();
		const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

		// If we added lastActive tracking, we could remove old entries
		// For this update, we'll keep the preferences indefinitely since we can't track last activity
	}
}, 60000); // Clean up every minute

module.exports = (app) => {
	// Listen for messages that contain "hello"
	app.message(/\bhello\b|\bhi\b|\bhey\b/i, async ({ message, say, client }) => {
		try {
			// Only respond to messages from users, not the bot itself
			if (message.subtype === undefined || message.subtype !== "bot_message") {
				// Mark this message as handled
				handledMessages.add(message.ts);

				const response = {
					text: `Hello <@${message.user}>!`,
					blocks: [
						{
							type: "section",
							text: {
								type: "mrkdwn",
								text: `Hello there, <@${message.user}>! 👋`,
							},
						},
					],
				};

				// Check if this message is part of a thread (likely in AI app container)
				if (message.thread_ts) {
					await client.chat.postMessage({
						channel: message.channel,
						thread_ts: message.thread_ts,
						text: response.text,
						blocks: response.blocks,
					});
				} else {
					// For regular direct messages, use the say() function
					await say(response);
				}
			}
		} catch (error) {
			console.error("Error handling hello message:", error);
		}
	});

	// Listen for messages that contain "thanks" or "thank you"
	app.message(/thanks|thank you/i, async ({ message, say, client }) => {
		try {
			// Only respond to messages from users, not the bot itself
			if (message.subtype === undefined || message.subtype !== "bot_message") {
				// Mark this message as handled
				handledMessages.add(message.ts);

				const response = {
					text: `You're welcome, <@${message.user}>!`,
					blocks: [
						{
							type: "section",
							text: {
								type: "mrkdwn",
								text: `You're welcome, <@${message.user}>! 😊`,
							},
						},
					],
				};

				// Check if this message is part of a thread (likely in AI app container)
				if (message.thread_ts) {
					await client.chat.postMessage({
						channel: message.channel,
						thread_ts: message.thread_ts,
						text: response.text,
						blocks: response.blocks,
					});
				} else {
					// For regular direct messages, use the say() function
					await say(response);
				}
			}
		} catch (error) {
			console.error("Error handling thanks message:", error);
		}
	});

	// Handle model selection messages
	app.message(
		/^use (claude|chatgpt|gemini)$/i,
		async ({ message, say, client, matches }) => {
			try {
				// Only respond to messages from users, not the bot itself
				if (
					message.subtype === undefined ||
					message.subtype !== "bot_message"
				) {
					// Mark this message as handled
					handledMessages.add(message.ts);

					const modelName = matches[1].toLowerCase();

					// Store user preference with timestamp
					userModelPreferences.set(message.user, {
						model: modelName,
						lastActive: Date.now(),
					});

					const response = {
						text: `I'll use ${modelName.toUpperCase()} for your future questions.`,
						blocks: [
							{
								type: "section",
								text: {
									type: "mrkdwn",
									text: `I'll use *${modelName.toUpperCase()}* for your future questions. You can change this anytime by typing \`use claude\`, \`use chatgpt\`, or \`use gemini\`.`,
								},
							},
						],
					};

					// Check if this message is part of a thread (likely in AI app container)
					if (message.thread_ts) {
						await client.chat.postMessage({
							channel: message.channel,
							thread_ts: message.thread_ts,
							text: response.text,
							blocks: response.blocks,
						});
					} else {
						// For regular direct messages, use the say() function
						await say(response);
					}
				}
			} catch (error) {
				console.error("Error handling model selection message:", error);
			}
		},
	);

	// Handle direct messages to the bot using Dify
	// This should be the last handler to catch all other direct messages
	app.message(async ({ message, say, client, next }) => {
		try {
			// Skip if message is from a bot or has specific subtypes
			if (message.bot_id || message.subtype) {
				return await next();
			}

			// Skip if this message has already been handled
			if (handledMessages.has(message.ts)) {
				return await next();
			}

			// Check if this is a direct message channel
			try {
				const conversationInfo = await client.conversations.info({
					channel: message.channel,
				});

				const isDM = conversationInfo.channel.is_im;

				if (isDM) {
					// Check for predefined responses
					const predefinedResponse = predefinedResponses.findPredefinedResponse(
						message.text,
					);

					if (predefinedResponse) {
						// Log that we're using a predefined response
						console.log(`Using predefined response for DM: "${message.text}"`);

						// Format and respond with the predefined answer
						const formattedResponse = difyService.formatDifyResponse(
							predefinedResponse,
							blockKit,
							"claude", // Default model for predefined responses
						);

						// Check if this message is part of a thread (likely in AI app container)
						if (message.thread_ts) {
							await client.chat.postMessage({
								channel: message.channel,
								thread_ts: message.thread_ts,
								text: formattedResponse.text,
								blocks: formattedResponse.blocks,
							});
						} else {
							// For regular direct messages, use the say() function
							await say(formattedResponse);
						}

						// Mark message as handled
						handledMessages.add(message.ts);

						// Don't process further handlers
						return;
					}

					// Get user's preferred model or default to Claude
					let modelName = "claude"; // Default model
					const userPref = userModelPreferences.get(message.user);
					if (userPref?.model) {
						modelName = userPref.model;
						// Update last active timestamp
						userPref.lastActive = Date.now();
					}

					// Send message to Dify with user's preferred model
					const difyResponse = await difyService.sendChatMessage(
						message.text,
						message.user,
						modelName,
					);

					// Format and respond with Dify's answer
					const formattedResponse = difyService.formatDifyResponse(
						difyResponse,
						blockKit,
						modelName,
					);

					// Check if this message is part of a thread (likely in AI app container)
					if (message.thread_ts) {
						await client.chat.postMessage({
							channel: message.channel,
							thread_ts: message.thread_ts,
							text: formattedResponse.text,
							blocks: formattedResponse.blocks,
						});
					} else {
						// For regular direct messages, use the say() function
						await say(formattedResponse);
					}

					// Mark message as handled
					handledMessages.add(message.ts);

					// Don't process further handlers
					return;
				}
			} catch (error) {
				console.error("Error checking conversation info:", error);
			}

			// Continue to next handler if not handled
			await next();
		} catch (error) {
			console.error("Error handling direct message with Dify:", error);
			await next();
		}
	});
};
