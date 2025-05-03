class TokenBucket {
    constructor({ capacity = 10, refillRate = 1, refillInterval = 1000 } = {}) { // constructor initializes the token bucket with a given capacity, refill rate, and refill interval
      this.capacity = capacity;
      this.refillRate = refillRate; // tokens per interval
      this.refillInterval = refillInterval; // ms
      this.buckets = new Map(); // format: key -> { tokens, lastRefill }
    }
  

    // indicates the fucntion is private and not to be used outside the class
    // _refill is a private method that refills the token bucket for a given key
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
  
    // tryRemoveToken is a custom public method that attempts to remove a token from the bucket for a given key
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
  
    // getTokens is a custom public method that fetches tokens available in the bucket for a given key
    getTokens(key = 'global') { // returns the number of tokens available in the bucket for a given key
      if (this.capacity <= 0) return 0; // if the capacity is 0, no tokens are available
      const bucket = this._refill(key);
      return bucket.tokens;
    }
  }
  
  module.exports = TokenBucket;
  