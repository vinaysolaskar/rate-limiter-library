const MemoryStore = require('../storage/memory');

/**
 * SlidingWindowCounter
 * Implements the Sliding Window Counter rate limiting algorithm.
 * @class
 * @example
 * const limiter = new SlidingWindowCounter({ windowSize: 60000, limit: 100 });
 * if (await limiter.tryRequest('user123')) { ... }
 */
class SlidingWindowCounter {
  /**
   * @param {Object} options
   * @param {number} [options.windowSize=60000] - Window size in ms.
   * @param {number} [options.limit=100] - Max requests per window.
   * @param {Object} [options.store] - Pluggable storage (default: MemoryStore)
   */
  constructor({ windowSize = 60000, limit = 100, store } = {}) {
    this.windowSize = windowSize;
    this.limit = limit;
    this.store = store || new MemoryStore();
  }

  /**
   * Helper to align the current time to the start of the window.
   * @param {number} now
   * @returns {number}
   * @private
   */
  _getWindowStart(now) {
    return now - (now % this.windowSize);
  }

  /**
   * Attempts to allow a request for the specified key.
   * Calculates the weighted sum of requests in the current and previous window.
   * @param {string} [key='global']
   * @returns {Promise<boolean>}
   */
  async tryRequest(key = 'global') {
    const now = Date.now();
    const windowStart = this._getWindowStart(now);

    let data = await this.store.get(key);
    if (!data) {
      data = {
        currentWindowStart: windowStart,
        currentCount: 0,
        prevCount: 0
      };
    }

    if (windowStart !== data.currentWindowStart) {
      data.prevCount = data.currentCount;
      data.currentCount = 0;
      data.currentWindowStart = windowStart;
    }

    const elapsed = now - windowStart;
    const weight = 1 - (elapsed / this.windowSize);
    const total = data.currentCount + data.prevCount * weight;

    if (total < this.limit) {
      data.currentCount += 1;
      await this.store.set(key, data);
      return true;
    } else {
      await this.store.set(key, data);
      return false;
    }
  }
}

module.exports = SlidingWindowCounter;