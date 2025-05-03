/**
 * SlidingWindowCounter
 * 
 * Implements the Sliding Window Counter rate limiting algorithm.
 * This algorithm allows a maximum number of requests per rolling time window,
 * smoothing out bursts and providing fair, efficient rate limiting.
 * 
 * @class
 * @example
 * const SlidingWindowCounter = require('./src/algorithms/slidingWindowCounter');
 * const limiter = new SlidingWindowCounter({ windowSize: 60000, limit: 100 }); // 100 requests per minute
 * 
 * const userKey = 'user123';
 * if (limiter.tryRequest(userKey)) {
 *   // Allow request
 * } else {
 *   // Block request (rate limited)
 * }
 */
class SlidingWindowCounter {
    /**
     * @param {Object} options
     * @param {number} [options.windowSize=60000] - Size of the sliding window in milliseconds (default: 1 minute)
     * @param {number} [options.limit=100] - Maximum number of requests allowed per window (default: 100)
     */
    constructor({ windowSize = 60000, limit = 100 } = {}) {
      /**
       * Size of the sliding window in milliseconds.
       * @type {number}
       */
      this.windowSize = windowSize; // e.g., 60,000 ms = 1 minute
  
      /**
       * Maximum number of requests allowed per window.
       * @type {number}
       */
      this.limit = limit;
  
      /**
       * Internal storage for per-key window data.
       * Format: key -> { currentWindowStart, currentCount, prevCount }
       * @type {Map<string, Object>}
       */
      this.windows = new Map();
    }
  
    /**
     * Helper to align the current time to the start of the window.
     * @param {number} now - Current timestamp in ms
     * @returns {number} - Timestamp of window start
     * @private
     */
    _getWindowStart(now) {
      return now - (now % this.windowSize); // E.g., aligns 12:01:23.456 to 12:01:00.000
    }
  
    /**
     * Attempts to allow a request for the specified key.
     * Calculates the weighted sum of requests in the current and previous window.
     * If the sum is below the limit, the request is allowed and the count is incremented.
     * 
     * @param {string} [key='global'] - Unique identifier for user/client (e.g., IP, user ID)
     * @returns {boolean} - True if request is allowed, false if rate limited
     */
    tryRequest(key = 'global') {
      const now = Date.now();
      const windowStart = this._getWindowStart(now);
  
      // Retrieve or initialize window data for the key
      let data = this.windows.get(key);
      if (!data) {
        data = {
          currentWindowStart: windowStart,
          currentCount: 0,
          prevCount: 0
        };
      }
  
      // If we've moved to a new window, shift counts
      if (windowStart !== data.currentWindowStart) {
        data.prevCount = data.currentCount;
        data.currentCount = 0;
        data.currentWindowStart = windowStart;
      }
  
      // Calculate how much of the current window has passed (in ms)
      const elapsed = now - windowStart;
      // Weight for the previous window's count
      const weight = 1 - (elapsed / this.windowSize);
  
      // Weighted sum: current window count + weighted previous window count
      const total = data.currentCount + data.prevCount * weight;
  
      if (total < this.limit) {
        data.currentCount += 1;
        this.windows.set(key, data);
        return true; // Allow request
      } else {
        this.windows.set(key, data);
        return false; // Rate limited
      }
    }
  }
  
  module.exports = SlidingWindowCounter;
  