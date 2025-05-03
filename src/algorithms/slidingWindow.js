class SlidingWindowCounter {
    constructor({ windowSize = 60000, limit = 100 } = {}) {
      this.windowSize = windowSize; // e.g., 60,000 ms = 1 minute
      this.limit = limit;
      this.windows = new Map(); // format: key -> { currentWindowStart, currentCount, prevCount }
    }
  
    _getWindowStart(now) {
      return now - (now % this.windowSize); // Aligns the current time to the start of the window
    }
  
    tryRequest(key = 'global') {
      const now = Date.now();
      const windowStart = this._getWindowStart(now);
  
      let data = this.windows.get(key);
      if (!data) {
        data = {
          currentWindowStart: windowStart,
          currentCount: 0,
          prevCount: 0
        }; // Initialize the data for this key
      }
  
      // If we've moved to a new window
      if (windowStart !== data.currentWindowStart) {
        data.prevCount = data.currentCount;
        data.currentCount = 0;
        data.currentWindowStart = windowStart;
      }
  
      // Calculate how much of the current window has passed
      const elapsed = now - windowStart;
      const weight = 1 - (elapsed / this.windowSize);
  
      // Interpolated count
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