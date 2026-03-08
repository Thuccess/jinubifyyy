/**
 * Central logger utility for API, uploads, and auth.
 * Re-exports the winston logger from middleware for use in routes and services.
 */
import logger, { logError } from '../middleware/logger.js';

export { logError };
export default logger;
