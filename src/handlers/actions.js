// Action handlers for Slack interactive elements
const difyService = require("../utils/difyService");

module.exports = (app) => {
	// Handle button clicks
	app.action("button_click", async ({ action, ack, respond }) => {
		try {
			// Acknowledge the action
			await ack();

			// Respond to the action
			await respond({
				text: `You clicked the button with value: ${action.value}`,
				replace_original: false,
			});
		} catch (error) {
			console.error("Error handling button_click action:", error);
		}
	});

	// Handle select menu changes
	app.action("select_menu", async ({ action, ack, respond }) => {
		try {
			// Acknowledge the action
			await ack();

			// Respond to the action
			await respond({
				text: `You selected: ${action.selected_option.text.text}`,
				replace_original: false,
			});
		} catch (error) {
			console.error("Error handling select_menu action:", error);
		}
	});

	// Handle positive feedback for Dify responses
	app.action(
		"dify_feedback_positive",
		async ({ action, ack, respond, body }) => {
			try {
				// Acknowledge the action
				await ack();

				// Extract the message ID from the value
				const messageId = action.value;

				// Provide positive feedback (1)
				const result = await difyService.provideFeedback(
					messageId,
					1,
					body.user.id,
				);

				// Check if feedback was successful
				if (result.success === false) {
					console.log("Feedback submission failed:", result.error);
					await respond({
						text: "Thank you for your feedback! (Note: There was an issue recording it, but your input is still valuable)",
						replace_original: false,
						response_type: "ephemeral",
					});
					return;
				}

				// Respond to the user
				await respond({
					text: "Thank you for your positive feedback!",
					replace_original: false,
					response_type: "ephemeral",
				});
			} catch (error) {
				console.error("Error handling dify_feedback_positive action:", error);
				await respond({
					text: "Thanks for your feedback! (There was an issue recording it, but we appreciate your input)",
					replace_original: false,
					response_type: "ephemeral",
				});
			}
		},
	);

	// Handle negative feedback for Dify responses
	app.action(
		"dify_feedback_negative",
		async ({ action, ack, respond, body }) => {
			try {
				// Acknowledge the action
				await ack();

				// Extract the message ID from the value
				const messageId = action.value;

				// Provide negative feedback (0)
				const result = await difyService.provideFeedback(
					messageId,
					0,
					body.user.id,
				);

				// Check if feedback was successful
				if (result.success === false) {
					console.log("Feedback submission failed:", result.error);
					await respond({
						text: "Thank you for your feedback! (Note: There was an issue recording it, but your input is still valuable)",
						replace_original: false,
						response_type: "ephemeral",
					});
					return;
				}

				// Respond to the user
				await respond({
					text: "Thank you for your feedback. We'll work to improve our responses.",
					replace_original: false,
					response_type: "ephemeral",
				});
			} catch (error) {
				console.error("Error handling dify_feedback_negative action:", error);
				await respond({
					text: "Thanks for your feedback! (There was an issue recording it, but we appreciate your input)",
					replace_original: false,
					response_type: "ephemeral",
				});
			}
		},
	);
};
