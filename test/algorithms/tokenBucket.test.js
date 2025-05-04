const TokenBucket = require('../../src/algorithms/tokenBucket');

describe('TokenBucket', () => {
  // Mark test function as async
  it('allows requests within the bucket capacity', async () => {
    const limiter = new TokenBucket({ capacity: 3, refillRate: 1, refillInterval: 1000 });
    
    // Use await for async methods
    expect(await limiter.tryRemoveToken('user1')).toBe(true);
    expect(await limiter.tryRemoveToken('user1')).toBe(true);
    expect(await limiter.tryRemoveToken('user1')).toBe(true);
    expect(await limiter.tryRemoveToken('user1')).toBe(false); // Rate limited
  });

  // Use async/await instead of done()
  it('refills tokens after interval', async () => {
    const limiter = new TokenBucket({ capacity: 2, refillRate: 1, refillInterval: 100 });
    
    // Initial requests
    await limiter.tryRemoveToken('user2');
    await limiter.tryRemoveToken('user2');

    // Wait 110ms for refill
    await new Promise(resolve => setTimeout(resolve, 110));
    
    // Check if token is refilled
    expect(await limiter.tryRemoveToken('user2')).toBe(true);
  }, 10000); // Increase timeout if needed
});
