const { app } = require('./src/bot');

// Start the app with Socket Mode (no port needed)
(async () => {
  try {
    // For Socket Mode, we don't need to specify a port
    await app.start();
    console.log(`⚡️ Slack bot is running in Socket Mode`);
  } catch (error) {
    console.error('Error starting app:', error);
    process.exit(1);
  }
})();
