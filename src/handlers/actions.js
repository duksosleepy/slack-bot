// Action handlers for Slack interactive elements
module.exports = (app) => {
    // Handle button clicks
    app.action('button_click', async ({ action, ack, respond }) => {
      try {
        // Acknowledge the action
        await ack();

        // Respond to the action
        await respond({
          text: `You clicked the button with value: ${action.value}`,
          replace_original: false,
        });
      } catch (error) {
        console.error('Error handling button_click action:', error);
      }
    });

    // Handle select menu changes
    app.action('select_menu', async ({ action, ack, respond }) => {
      try {
        // Acknowledge the action
        await ack();

        // Respond to the action
        await respond({
          text: `You selected: ${action.selected_option.text.text}`,
          replace_original: false,
        });
      } catch (error) {
        console.error('Error handling select_menu action:', error);
      }
    });
  };
