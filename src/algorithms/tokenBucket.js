const MemoryStore = require('../storage/memory');
/**
 * TokenBucket implements the token bucket rate limiting algorithm.
 * 
 * @param {Object} options
 * @param {number} [options.capacity=10] - Maximum number of tokens in the bucket.
 * @param {number} [options.refillRate=1] - Number of tokens added per interval.
 * @param {number} [options.refillInterval=1000] - Interval (ms) at which tokens are refilled.
 * @param {Object} [options.store] - Pluggable storage (default: MemoryStore)
 */
class TokenBucket {
    constructor({ capacity = 10, refillRate = 1, refillInterval = 1000, store } = {}) {
      this.capacity = capacity;
      this.refillRate = refillRate; // tokens per interval
      this.refillInterval = refillInterval; // ms
      this.store = store || new MemoryStore();
    }
  
    /**
   * Refills the token bucket for a given key based on elapsed time.
   * @private
   * @param {string} key - Unique identifier for the bucket (e.g., user ID, IP).
   * @returns {Promise<Object>} - The updated bucket state.
   */
    async _refill(key) {
      const now = Date.now();  // gives time in milliseconds 
      let bucket = await this.store.get(key);
      if (!bucket) {
        bucket = { tokens: this.capacity, lastRefill: now };
      }
      const elapsed = now - bucket.lastRefill; // calculates the elapsed time since the last refill
  
      if (elapsed > 0) {
        const tokensToAdd = Math.floor(elapsed / this.refillInterval) * this.refillRate;
        bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd); // ensures that the tokens do not exceed the capacity of the bucket
        bucket.lastRefill = bucket.lastRefill + Math.floor(elapsed / this.refillInterval) * this.refillInterval;
      }
      await this.store.set(key, bucket);
      return bucket;
    }

    /**
   * Attempts to remove a token for a given key.
   * @param {string} [key='global'] - Unique identifier for the bucket.
   * @returns {Promise<boolean>} - True if a token was removed, false otherwise.
   */
    async tryRemoveToken(key = 'global') {  // returns true if a token is successfully removed, false otherwise
      if (this.capacity <= 0) return false; // if the capacity is 0, no tokens can be removed
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
   * @param {string} [key='global'] - Unique identifier for the bucket.
   * @returns {Promise<number>} - Number of available tokens.
   */
    async getTokens(key = 'global') { // returns the number of tokens available in the bucket for a given key
      if (this.capacity <= 0) return 0; // if the capacity is 0, no tokens are available
      const bucket = await this._refill(key);
      return bucket.tokens;
    }
  }
  
  module.exports = TokenBucket;
