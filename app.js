const { app } = require("./src/bot");

// Start the app with Socket Mode (no port needed)
(async () => {
	try {
		// For Socket Mode, we don't need to specify a port
		await app.start();
		console.log("⚡️ Bolt app is running!");
	} catch (error) {
		console.error("Error starting app:", error);
		process.exit(1);
	}
})();
