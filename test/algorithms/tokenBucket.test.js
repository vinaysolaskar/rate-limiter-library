const TokenBucket = require('../../src/algorithms/tokenBucket');
const MemoryStore = require('../../src/storage/memory');

describe('TokenBucket', () => {
  let limiter;
  beforeEach(() => {
    limiter = new TokenBucket({ capacity: 3, refillRate: 1, refillInterval: 1000, store: new MemoryStore() });
  });

  it('allows requests within the bucket capacity', async () => {
    expect(await limiter.tryRemoveToken('user1')).toBe(true);
    expect(await limiter.tryRemoveToken('user1')).toBe(true);
    expect(await limiter.tryRemoveToken('user1')).toBe(true);
    expect(await limiter.tryRemoveToken('user1')).toBe(false); // Should be rate limited
  });

  it('refills tokens after interval', async () => {
    await limiter.tryRemoveToken('user2');
    await limiter.tryRemoveToken('user2');
    await limiter.tryRemoveToken('user2');
    await new Promise(res => setTimeout(res, 1100));
    expect(await limiter.tryRemoveToken('user2')).toBe(true);
  }, 3000);

  it('returns correct token count', async () => {
    expect(await limiter.getTokens('user3')).toBe(3);
    await limiter.tryRemoveToken('user3');
    expect(await limiter.getTokens('user3')).toBe(2);
  });

  it('returns false if capacity is zero', async () => {
    const zeroLimiter = new TokenBucket({ capacity: 0 });
    expect(await zeroLimiter.tryRemoveToken('any')).toBe(false);
    expect(await zeroLimiter.getTokens('any')).toBe(0);
  });

  it('should isolate buckets by key', async () => {
    await limiter.tryRemoveToken('userA');
    expect(await limiter.getTokens('userA')).toBe(2);
    expect(await limiter.getTokens('userB')).toBe(3);
  });
});