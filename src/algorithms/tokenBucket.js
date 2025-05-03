/**
 * TokenBucket implements the token bucket rate limiting algorithm.
 * 
 * @param {Object} options
 * @param {number} [options.capacity=10] - Maximum number of tokens in the bucket.
 * @param {number} [options.refillRate=1] - Number of tokens added per interval.
 * @param {number} [options.refillInterval=1000] - Interval (ms) at which tokens are refilled.
 */

class TokenBucket {
    constructor({ capacity = 10, refillRate = 1, refillInterval = 1000 } = {}) { // constructor initializes the token bucket with a given capacity, refill rate, and refill interval
      this.capacity = capacity;
      this.refillRate = refillRate; // tokens per interval
      this.refillInterval = refillInterval; // ms
      this.buckets = new Map(); // format: key -> { tokens, lastRefill }
    }
  
    /**
   * Refills the token bucket for a given key based on elapsed time.
   * @private
   * @param {string} key - Unique identifier for the bucket (e.g., user ID, IP).
   * @returns {Object} - The updated bucket state.
   */
    _refill(key) {
      const now = Date.now();  // gives time in milliseconds 
      const bucket = this.buckets.get(key) || { tokens: this.capacity, lastRefill: now }; 
      const elapsed = now - bucket.lastRefill; // calculates the elapsed time since the last refill
  
      if (elapsed > 0) {
        const tokensToAdd = Math.floor(elapsed / this.refillInterval) * this.refillRate;
        bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd); // ensures that the tokens do not exceed the capacity of the bucket
        bucket.lastRefill = bucket.lastRefill + Math.floor(elapsed / this.refillInterval) * this.refillInterval;
      }
      this.buckets.set(key, bucket); // updates the bucket in the map
      return bucket;
    }

    /**
   * Attempts to remove a token for a given key.
   * @param {string} [key='global'] - Unique identifier for the bucket.
   * @returns {boolean} - True if a token was removed, false otherwise.
   */
    tryRemoveToken(key = 'global') {  // returns true if a token is successfully removed, false otherwise
      if (this.capacity <= 0) return false; // if the capacity is 0, no tokens can be removed
      const bucket = this._refill(key);
      if (bucket.tokens > 0) {
        bucket.tokens -= 1;
        this.buckets.set(key, bucket);
        return true;
      }
      return false;
    }
 
    /**
   * Returns the number of available tokens for a given key.
   * @param {string} [key='global'] - Unique identifier for the bucket.
   * @returns {number} - Number of available tokens.
   */
    getTokens(key = 'global') { // returns the number of tokens available in the bucket for a given key
      if (this.capacity <= 0) return 0; // if the capacity is 0, no tokens are available
      const bucket = this._refill(key);
      return bucket.tokens;
    }
  }
  
  module.exports = TokenBucket;
  