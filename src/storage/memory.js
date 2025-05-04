/**
 * MemoryStore
 * Simple in-memory key-value store for rate limiter state.
 * Provides async get, set, and delete methods.
 */
class MemoryStore {
  constructor() {
    this.map = new Map();
  }

  /**
   * Get value for a key.
   * @param {string} key
   * @returns {Promise<any|undefined>}
   */
  async get(key) {
    if (typeof key !== 'string') throw new Error('Key must be a string');
    // If available, use structuredClone to avoid reference issues
    const value = this.map.get(key);
    return (typeof structuredClone === 'function' && value) ? structuredClone(value) : value;
  }

  /**
   * Set value for a key.
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  async set(key, value) {
    if (typeof key !== 'string') throw new Error('Key must be a string');
    this.map.set(key, (typeof structuredClone === 'function') ? structuredClone(value) : value);
  }

  /**
   * Delete a key.
   * @param {string} key
   * @returns {Promise<void>}
   */
  async delete(key) {
    if (typeof key !== 'string') throw new Error('Key must be a string');
    this.map.delete(key);
  }
}

module.exports = MemoryStore;