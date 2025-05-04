const MemoryStore = require('../../src/storage/memory');

describe('MemoryStore', () => {
  let store;

  beforeEach(() => {
    store = new MemoryStore();
  });

  it('should set and get values', async () => {
    await store.set('foo', { a: 1 });
    expect(await store.get('foo')).toEqual({ a: 1 });
  });

  it('should return undefined for missing keys', async () => {
    expect(await store.get('missing')).toBeUndefined();
  });

  it('should delete keys', async () => {
    await store.set('foo', 123);
    await store.delete('foo');
    expect(await store.get('foo')).toBeUndefined();
  });

  it('should handle different value types', async () => {
    await store.set('num', 42);
    await store.set('str', 'hello');
    await store.set('obj', { x: 1 });
    expect(await store.get('num')).toBe(42);
    expect(await store.get('str')).toBe('hello');
    expect(await store.get('obj')).toEqual({ x: 1 });
  });
});
