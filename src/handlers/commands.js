// Command handlers for Slack slash commands
module.exports = (app) => {
    // Handle /hello command
    app.command('/hello', async ({ command, ack, respond }) => {
      try {
        // Acknowledge command request
        await ack();

        // Respond to the command
        await respond({
          text: `Hello <@${command.user_id}>!`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `Hello <@${command.user_id}>! How can I help you today?`,
              },
            },
          ],
        });
      } catch (error) {
        console.error('Error handling /hello command:', error);
      }
    });

    // Handle /help command
    app.command('/help', async ({ command, ack, respond }) => {
      try {
        // Acknowledge command request
        await ack();

        // Respond with help information
        await respond({
          text: 'Available commands:',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*Available Commands:*',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '• `/hello` - Greet the bot\n• `/help` - Show this help message',
              },
            },
          ],
        });
      } catch (error) {
        console.error('Error handling /help command:', error);
      }
    });
  };
