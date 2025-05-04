/**
 * MemoryStore
 * 
 * Simple in-memory key-value store for rate limiter state.
 * Provides async get, set, and delete methods to match possible async storage (like Redis).
 */
class MemoryStore {
  constructor() {
    this.map = new Map();
  }

  /**
   * Get value for a key.
   * @param {string} key
   * @returns {Promise<any>}
   */
  async get(key) {
    return this.map.get(key);
  }

  /**
   * Set value for a key.
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  async set(key, value) {
    this.map.set(key, value);
  }

  /**
   * Delete a key.
   * @param {string} key
   * @returns {Promise<void>}
   */
  async delete(key) {
    this.map.delete(key);
  }
}

module.exports = MemoryStore;