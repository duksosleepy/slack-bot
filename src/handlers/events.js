// Event handlers for Slack events
module.exports = (app) => {
    // Handle app_mention events (when the bot is mentioned)
    app.event('app_mention', async ({ event, say }) => {
      try {
        await say({
          text: `Hello <@${event.user}>! You mentioned me in <#${event.channel}>`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `Hello <@${event.user}>! How can I help you today?`,
              },
            },
          ],
        });
      } catch (error) {
        console.error('Error handling app_mention event:', error);
      }
    });

    // Handle team_join events (when a new user joins the workspace)
    app.event('team_join', async ({ event, client }) => {
      try {
        await client.chat.postMessage({
          channel: event.user.id,
          text: `Welcome to the team, <@${event.user.id}>! 👋`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `Welcome to the team, <@${event.user.id}>! 👋\n\nWe're glad you're here! Here are a few things to help you get started:`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '• Browse channels and join ones relevant to your work\n• Introduce yourself in #introductions\n• Set up your profile with a photo and details',
              },
            },
          ],
        });
      } catch (error) {
        console.error('Error handling team_join event:', error);
      }
    });
  };
