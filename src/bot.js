const { App } = require('@slack/bolt');
const config = require('./config');
const { loggingMiddleware } = require('./middleware/logging');

// Initialize the Bolt app with Socket Mode
const app = new App({
  token: config.slack.botToken,
  signingSecret: config.slack.signingSecret,
  socketMode: true,
  appToken: config.slack.appToken,
  // No HTTP customRoutes needed for Socket Mode
  port: config.slack.port
});

// Apply middleware
app.use(loggingMiddleware());

// Load handlers
require('./handlers/events')(app);
require('./handlers/commands')(app);
require('./handlers/messages')(app);
require('./handlers/actions')(app);

// Export the app
module.exports = { app };
