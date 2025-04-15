// Configuration management
require("dotenv").config();

// Export configuration variables
module.exports = {
	slack: {
		botToken: process.env.SLACK_BOT_TOKEN,
		signingSecret: process.env.SLACK_SIGNING_SECRET,
		appToken: process.env.SLACK_APP_TOKEN, // Required for Socket Mode
		port: 3000,
	},
	dify: {
		apiKey: process.env.DIFY_API_KEY,
	},
};
