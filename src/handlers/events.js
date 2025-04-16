// Event handlers for Slack events
const difyService = require("../utils/difyService");
const blockKit = require("../utils/blockKit");
const predefinedResponses = require("../utils/predefinedResponses");

// Track handled events to prevent duplicate processing
const handledEvents = new Set();

// Clean up old handled events (keep only recent ones)
setInterval(() => {
	// Keep only 100 most recent events
	if (handledEvents.size > 100) {
		const toRemove = handledEvents.size - 100;
		const iterator = handledEvents.values();
		for (let i = 0; i < toRemove; i++) {
			handledEvents.delete(iterator.next().value);
		}
	}
}, 60000); // Clean up every minute

module.exports = (app) => {
	// Handle app_mention events (when the bot is mentioned)
	app.event("app_mention", async ({ event, say, client }) => {
		try {
			// Skip if this event has already been handled
			if (handledEvents.has(event.ts)) {
				return;
			}

			// Mark this event as handled
			handledEvents.add(event.ts);

			// Extract the actual message content
			// Remove the bot mention from the text
			let messageText = event.text;
			const botUserId = (await app.client.auth.test()).user_id;
			messageText = messageText.replace(`<@${botUserId}>`, "").trim();

			if (!messageText) {
				// If there's no actual message content, just send a greeting
				await say({
					text: `Hello <@${event.user}>! How can I help you today?`,
					blocks: [
						{
							type: "section",
							text: {
								type: "mrkdwn",
								text: `Hello <@${event.user}>! How can I help you today?`,
							},
						},
					],
				});
				return;
			}

			// Check for predefined responses
			const predefinedResponse =
				predefinedResponses.findPredefinedResponse(messageText);

			if (predefinedResponse) {
				// Log that we're using a predefined response
				console.log(`Using predefined response for message: "${messageText}"`);

				// Format and respond with the predefined answer
				const formattedResponse = difyService.formatDifyResponse(
					predefinedResponse,
					blockKit,
					"claude", // Default model for predefined responses
				);

				// Respond directly to the channel
				await say(formattedResponse);
				return;
			}

			// Get user's preferred model or default to Claude
			const modelName = "claude"; // Default model

			// Send message to Dify
			const difyResponse = await difyService.sendChatMessage(
				messageText,
				event.user,
				modelName,
			);

			// Format and respond with Dify's answer
			const formattedResponse = difyService.formatDifyResponse(
				difyResponse,
				blockKit,
				modelName,
			);

			// Respond directly to the channel, not in a thread
			await say(formattedResponse);
		} catch (error) {
			console.error("Error handling app_mention event:", error);

			// Send an error message
			await say({
				text: "I'm sorry, I encountered an error processing your request.",
			});
		}
	});

	// Handle team_join events (when a new user joins the workspace)
	app.event("team_join", async ({ event, client }) => {
		try {
			await client.chat.postMessage({
				channel: event.user.id,
				text: `Welcome to the team, <@${event.user.id}>! 👋`,
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: `Welcome to the team, <@${event.user.id}>! 👋\n\nWe're glad you're here! Here are a few things to help you get started:`,
						},
					},
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: "• Browse channels and join ones relevant to your work\n• Introduce yourself in #introductions\n• Set up your profile with a photo and details",
						},
					},
				],
			});
		} catch (error) {
			console.error("Error handling team_join event:", error);
		}
	});
};
