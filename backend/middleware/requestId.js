import { randomUUID } from 'crypto';

/**
 * Request ID middleware
 * Generates a unique request ID for each request and adds it to:
 * - req.id (for use in the request)
 * - res.headers['X-Request-ID'] (for client tracking)
 */
export const requestIdMiddleware = (req, res, next) => {
  // Generate or use existing request ID from header
  const requestId = req.headers['x-request-id'] || randomUUID();
  
  // Add to request object
  req.id = requestId;
  
  // Add to response header
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

export default requestIdMiddleware;
