const SlidingWindowCounter = require('../../src/algorithms/slidingWindow');

describe('SlidingWindowCounter', () => {
  it('allows requests within the limit', async () => {
    const limiter = new SlidingWindowCounter({ windowSize: 1000, limit: 3 });
    
    // Allowed requests
    expect(await limiter.tryRequest('user1')).toBe(true);
    expect(await limiter.tryRequest('user1')).toBe(true);
    expect(await limiter.tryRequest('user1')).toBe(true);
    
    // Rate limited
    expect(await limiter.tryRequest('user1')).toBe(false);
  });

  it('refills tokens after window slides', async () => {
    const limiter = new SlidingWindowCounter({ windowSize: 100, limit: 2 });
    
    // Use all tokens
    await limiter.tryRequest('user2');
    await limiter.tryRequest('user2');
    
    // Wait for window to slide (110ms)
    await new Promise(resolve => setTimeout(resolve, 110));
    
    // Should allow new requests
    expect(await limiter.tryRequest('user2')).toBe(true);
  }, 10000); // Increase timeout if needed
});
