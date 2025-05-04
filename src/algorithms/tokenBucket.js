const MemoryStore = require('../storage/memory');

/**
 * TokenBucket implements the token bucket rate limiting algorithm.
 * @param {Object} options
 * @param {number} [options.capacity=10] - Max tokens in the bucket.
 * @param {number} [options.refillRate=1] - Tokens added per interval.
 * @param {number} [options.refillInterval=1000] - Interval in ms.
 * @param {Object} [options.store] - Pluggable storage (default: MemoryStore)
 */
class TokenBucket {
  constructor({ capacity = 10, refillRate = 1, refillInterval = 1000, store } = {}) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.refillInterval = refillInterval;
    this.store = store || new MemoryStore();
  }

  /**
   * Refills the token bucket for a given key based on elapsed time.
   * @private
   * @param {string} key
   * @returns {Promise<Object>} - The updated bucket state.
   */
  async _refill(key) {
    const now = Date.now();
    let bucket = await this.store.get(key);
    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
    }
    const elapsed = now - bucket.lastRefill;
    if (elapsed > 0) {
      const tokensToAdd = Math.floor(elapsed / this.refillInterval) * this.refillRate;
      bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
      bucket.lastRefill = bucket.lastRefill + Math.floor(elapsed / this.refillInterval) * this.refillInterval;
    }
    await this.store.set(key, bucket);
    return bucket;
  }

  /**
   * Attempts to remove a token for a given key.
   * @param {string} [key='global']
   * @returns {Promise<boolean>}
   */
  async tryRemoveToken(key = 'global') {
    if (this.capacity <= 0) return false;
    const bucket = await this._refill(key);
    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      await this.store.set(key, bucket);
      return true;
    }
    await this.store.set(key, bucket);
    return false;
  }

  /**
   * Returns the number of available tokens for a given key.
   * @param {string} [key='global']
   * @returns {Promise<number>}
   */
  async getTokens(key = 'global') {
    if (this.capacity <= 0) return 0;
    const bucket = await this._refill(key);
    return bucket.tokens;
  }
}

module.exports = TokenBucket;
