const SlidingWindowCounter = require('../../src/algorithms/slidingWindow');
const MemoryStore = require('../../src/storage/memory');

describe('SlidingWindowCounter', () => {
  let limiter;
  beforeEach(() => {
    limiter = new SlidingWindowCounter({ windowSize: 1000, limit: 3, store: new MemoryStore() });
  });

  it('allows requests within the limit', async () => {
    expect(await limiter.tryRequest('user1')).toBe(true);
    expect(await limiter.tryRequest('user1')).toBe(true);
    expect(await limiter.tryRequest('user1')).toBe(true);
    expect(await limiter.tryRequest('user1')).toBe(false);
  });

  it('refills after window slides', async () => {
    await limiter.tryRequest('user2');
    await limiter.tryRequest('user2');
    await limiter.tryRequest('user2');
    await new Promise(res => setTimeout(res, 1100));
    expect(await limiter.tryRequest('user2')).toBe(true);
  }, 3000);

  it('should isolate windows by key', async () => {
    await limiter.tryRequest('userA');
    expect(await limiter.tryRequest('userB')).toBe(true);
    expect(await limiter.tryRequest('userB')).toBe(true);
    expect(await limiter.tryRequest('userB')).toBe(true);
    expect(await limiter.tryRequest('userB')).toBe(false);
  });

  it('should handle zero limit', async () => {
    const zeroLimiter = new SlidingWindowCounter({ windowSize: 1000, limit: 0 });
    expect(await zeroLimiter.tryRequest('userX')).toBe(false);
  });

  it('should handle window boundary edge case', async () => {
    // Fill up the window
    await limiter.tryRequest('edge');
    await limiter.tryRequest('edge');
    await limiter.tryRequest('edge');
    // Wait for just before the window ends
    await new Promise(res => setTimeout(res, 950));
    await new Promise(res => setTimeout(res, 100)); // Wait for window to slide
    expect(await limiter.tryRequest('edge')).toBe(true);
    // Wait for window to slide
    await new Promise(res => setTimeout(res, 100));
    // Should allow again
    expect(await limiter.tryRequest('edge')).toBe(true);
  }, 5000);
});
