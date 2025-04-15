// Message handlers for Slack messages
const difyService = require("../utils/difyService");
const blockKit = require("../utils/blockKit");

module.exports = (app) => {
	// Listen for messages that contain "hello"
	app.message("hello", async ({ message, say }) => {
		try {
			// Only respond to messages from users, not the bot itself
			if (message.subtype === undefined || message.subtype !== "bot_message") {
				await say({
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
				});
			}
		} catch (error) {
			console.error("Error handling hello message:", error);
		}
	});

	// Listen for messages that contain "thanks" or "thank you"
	app.message(/thanks|thank you/i, async ({ message, say }) => {
		try {
			// Only respond to messages from users, not the bot itself
			if (message.subtype === undefined || message.subtype !== "bot_message") {
				await say({
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
				});
			}
		} catch (error) {
			console.error("Error handling thanks message:", error);
		}
	});

	// Store user model preferences - key: userId, value: model name
	const userModelPreferences = new Map();

	// Handle model selection messages
	app.message(
		/^use (claude|chatgpt|gemini)$/i,
		async ({ message, say, matches }) => {
			try {
				// Only respond to messages from users, not the bot itself
				if (
					message.subtype === undefined ||
					message.subtype !== "bot_message"
				) {
					const modelName = matches[1].toLowerCase();

					// Store user preference
					userModelPreferences.set(message.user, modelName);

					await say({
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
					});
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

			// Check if this is a direct message channel
			try {
				const conversationInfo = await client.conversations.info({
					channel: message.channel,
				});

				const isDM = conversationInfo.channel.is_im;

				if (isDM) {
					// Show typing indicator
					await client.chat.postMessage({
						channel: message.channel,
						text: "_Thinking..._",
						blocks: [
							{
								type: "section",
								text: {
									type: "mrkdwn",
									text: "_Thinking..._",
								},
							},
						],
					});

					// Get user's preferred model or default to Claude
					const modelName = userModelPreferences.get(message.user) || "claude";

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
					await say(formattedResponse);

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
