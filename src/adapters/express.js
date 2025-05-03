/**
 * Express middleware adapter for rate limiting.
 * @param {Object} limiter - Instance of TokenBucket or SlidingWindowCounter
 * @param {Object} options - Configuration options
 * @param {Function} [options.keyGenerator] - Function to extract key from req (default: req.ip)
 * @param {Function} [options.onBlocked] - Function to handle blocked requests (default: 429 JSON)
 * @param {Object} [options.logger] - Logger object (default: console)
 */
function expressRateLimiter(limiter, options = {}) { // limiter is an instance of TokenBucket or SlidingWindowCounter, options is an object with optional properties like keyGenerator, onBlocked, and logger
    const keyGenerator = options.keyGenerator || ((req) => req.ip);
    const onBlocked =
      options.onBlocked ||
      ((req, res) => res.status(429).json({ error: 'Too Many Requests' }));
    const logger = options.logger || console;
  
    // Determine the correct method based on limiter type( TokenBucket or SlidingWindowCounter )
    const limiterMethod =
      typeof limiter.tryRemoveToken === 'function'
        ? limiter.tryRemoveToken.bind(limiter)
        : limiter.tryRequest.bind(limiter);
  
    return (req, res, next) => {
      const key = keyGenerator(req);
      const allowed = limiterMethod(key);
  
      if (allowed) {
        logger.info?.(`[RateLimiter] Allowed: ${key}`);
        next();
      } else {
        logger.warn?.(`[RateLimiter] Blocked: ${key}`);
        onBlocked(req, res);
      }
    };
  }
  
  module.exports = expressRateLimiter;