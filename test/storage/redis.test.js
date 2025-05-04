const Redis = require('ioredis-mock');
jest.mock('ioredis', () => require('ioredis-mock'));

const RedisStore = require('../../src/storage/redis');

describe('RedisStore', () => {
  let store;

  beforeEach(() => {
    store = new RedisStore();
  });

  it('should set and get values', async () => {
    await store.set('foo', { a: 1 });
    expect(await store.get('foo')).toEqual({ a: 1 });
  });

  it('should return null for missing keys', async () => {
    expect(await store.get('missing')).toBeNull();
  });

  it('should delete keys', async () => {
    await store.set('foo', 123);
    await store.delete('foo');
    expect(await store.get('foo')).toBeNull();
  });

  it('should handle JSON parse errors gracefully', async () => {
    // Directly set a non-JSON value in Redis
    await store.client.set('corrupt', 'not-json');
    await expect(store.get('corrupt')).rejects.toThrow();
  });
});
