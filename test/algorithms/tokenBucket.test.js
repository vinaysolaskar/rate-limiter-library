const TokenBucket = require('../../src/algorithms/tokenBucket');

describe('TokenBucket', () => {
  it('allows requests within the bucket capacity', () => {
    const limiter = new TokenBucket({ capacity: 3, refillRate: 1, refillInterval: 1000 });
    expect(limiter.tryRemoveToken('user1')).toBe(true);
    expect(limiter.tryRemoveToken('user1')).toBe(true);
    expect(limiter.tryRemoveToken('user1')).toBe(true);
    expect(limiter.tryRemoveToken('user1')).toBe(false); // Should be rate limited
  });

  it('refills tokens after interval', (done) => {
    const limiter = new TokenBucket({ capacity: 2, refillRate: 1, refillInterval: 100 });
    limiter.tryRemoveToken('user2');
    limiter.tryRemoveToken('user2');
    setTimeout(() => {
      expect(limiter.tryRemoveToken('user2')).toBe(true); // Should refill after 100ms
      done();
    }, 110);
  });
});
