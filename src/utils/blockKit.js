// Utility functions for creating Block Kit UI elements

/**
 * Creates a simple section block with text
 * @param {string} text - The text to display in the section
 * @returns {Object} A Slack Block Kit section object
 */
function section(text) {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text,
      },
    };
  }

  /**
   * Creates a divider block
   * @returns {Object} A Slack Block Kit divider object
   */
  function divider() {
    return {
      type: 'divider',
    };
  }

  /**
   * Creates a button element
   * @param {string} text - Button text
   * @param {string} actionId - Action identifier
   * @param {string} value - Button value
   * @param {string} [style] - Button style (primary, danger, or undefined for default)
   * @returns {Object} A Slack Block Kit button element
   */
  function button(text, actionId, value, style) {
    const button = {
      type: 'button',
      text: {
        type: 'plain_text',
        text,
        emoji: true,
      },
      action_id: actionId,
      value,
    };

    if (style) {
      button.style = style;
    }

    return button;
  }

  /**
   * Creates an actions block with multiple elements
   * @param {Array} elements - Array of Block Kit elements
   * @returns {Object} A Slack Block Kit actions object
   */
  function actions(elements) {
    return {
      type: 'actions',
      elements,
    };
  }

  module.exports = {
    section,
    divider,
    button,
    actions,
  };
