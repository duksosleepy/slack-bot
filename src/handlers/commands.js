// Command handlers for Slack slash commands
const difyService = require("../utils/difyService");
const blockKit = require("../utils/blockKit");

module.exports = (app) => {
	// Handle /hello command
	app.command("/hello", async ({ command, ack, respond }) => {
		try {
			// Acknowledge command request
			await ack();

			// Respond to the command
			await respond({
				text: `Hello <@${command.user_id}>!`,
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: `Hello <@${command.user_id}>! How can I help you today?`,
						},
					},
				],
			});
		} catch (error) {
			console.error("Error handling /hello command:", error);
		}
	});

	// Handle /operation_status command
	app.command("/operation_status", async ({ command, ack, respond }) => {
		await ack();
		respond("Wooah! It works!");
	});

	// Handle /help command
	app.command("/help", async ({ command, ack, respond }) => {
		try {
			// Acknowledge command request
			await ack();

			// Respond with help information
			await respond({
				text: "Available commands:",
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: "*Available Commands:*",
						},
					},
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: "• `/hello` - Greet the bot\n• `/help` - Show this help message\n• `/claude` - Ask a question to Claude AI\n• `/chatgpt` - Ask a question to ChatGPT\n• `/gemini` - Ask a question to Gemini",
						},
					},
				],
			});
		} catch (error) {
			console.error("Error handling /help command:", error);
		}
	});

	// Generic function to handle AI model commands
	const handleModelCommand = async (model, command, ack, respond) => {
		try {
			// Acknowledge command request
			await ack();

			const query = command.text;
			if (!query) {
				await respond({
					text: `Please provide a question or prompt to send to ${model.toUpperCase()}`,
					response_type: "ephemeral",
				});
				return;
			}

			// Send message to Dify with specified model
			const difyResponse = await difyService.sendChatMessage(
				query,
				command.user_id,
				model,
			);

			// Format and respond with the answer
			const formattedResponse = difyService.formatDifyResponse(
				difyResponse,
				blockKit,
				model,
			);
			await respond(formattedResponse);
		} catch (error) {
			console.error(`Error handling /${model} command:`, error);
			await respond({
				text: `Error communicating with ${model.toUpperCase()}`,
				response_type: "ephemeral",
			});
		}
	};

	// Handle /claude command
	app.command("/claude", async ({ command, ack, respond }) => {
		await handleModelCommand("claude", command, ack, respond);
	});

	// Handle /chatgpt command
	app.command("/chatgpt", async ({ command, ack, respond }) => {
		await handleModelCommand("chatgpt", command, ack, respond);
	});

	// Handle /gemini command
	app.command("/gemini", async ({ command, ack, respond }) => {
		await handleModelCommand("gemini", command, ack, respond);
	});
};
