/**
 * Middleware for logging incoming requests
 */
function loggingMiddleware({ logger = console } = {}) {
    return async ({ payload, next }) => {
      const startTime = new Date().getTime();

      // Continue processing the request
      await next();

      const endTime = new Date().getTime();
      const processingTime = endTime - startTime;

      // Log after the request is processed
      logger.info(`Request processed in ${processingTime}ms`);
    };
  }

  module.exports = { loggingMiddleware };
