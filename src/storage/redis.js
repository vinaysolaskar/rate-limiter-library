/**
 * RedisStore
 * Pluggable Redis storage for rate limiter state.
 * Uses ioredis for async get, set, and delete.
 */
const Redis = require('ioredis');

class RedisStore {
  /**
   * @param {Object} options - ioredis connection options
   */
  constructor(options = {}) {
    this.client = new Redis(options);
  }

  /**
   * Get value for a key.
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    if (typeof key !== 'string') throw new Error('Key must be a string');
    const value = await this.client.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch (err) {
      throw new Error(`Failed to parse JSON for key "${key}": ${err.message}`);
    }
  }

  /**
   * Set value for a key.
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  async set(key, value) {
    if (typeof key !== 'string') throw new Error('Key must be a string');
    await this.client.set(key, JSON.stringify(value));
  }

  /**
   * Delete a key.
   * @param {string} key
   * @returns {Promise<void>}
   */
  async delete(key) {
    if (typeof key !== 'string') throw new Error('Key must be a string');
    await this.client.del(key);
  }
}

module.exports = RedisStore;