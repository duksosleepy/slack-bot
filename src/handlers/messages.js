// Message handlers for Slack messages
module.exports = (app) => {
    // Listen for messages that contain "hello"
    app.message('hello', async ({ message, say }) => {
      try {
        // Only respond to messages from users, not the bot itself
        if (message.subtype === undefined || message.subtype !== 'bot_message') {
          await say({
            text: `Hello <@${message.user}>!`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `Hello there, <@${message.user}>! 👋`,
                },
              },
            ],
          });
        }
      } catch (error) {
        console.error('Error handling hello message:', error);
      }
    });

    // Listen for messages that contain "thanks" or "thank you"
    app.message(/thanks|thank you/i, async ({ message, say }) => {
      try {
        // Only respond to messages from users, not the bot itself
        if (message.subtype === undefined || message.subtype !== 'bot_message') {
          await say({
            text: `You're welcome, <@${message.user}>!`,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `You're welcome, <@${message.user}>! 😊`,
                },
              },
            ],
          });
        }
      } catch (error) {
        console.error('Error handling thanks message:', error);
      }
    });
  };
