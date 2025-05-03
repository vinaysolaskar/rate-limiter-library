const SlidingWindowCounter = require('../../src/algorithms/slidingWindow');

describe('SlidingWindowCounter', () => {
    it('should allow requests within the limit', () => {
        const limiter = new SlidingWindowCounter({ windowSize: 1000, limit: 3 });
        expect(limiter.tryRequest('user1')).toBe(true);
        expect(limiter.tryRequest('user1')).toBe(true);
        expect(limiter.tryRequest('user1')).toBe(true);
        expect(limiter.tryRequest('user1')).toBe(false); // Should be rate limited
    });


    it('should reset the count after the window size', (done) => {
        const limiter = new SlidingWindowCounter({ windowSize: 100, limit: 2 });
        limiter.tryRequest('user2');
        limiter.tryRequest('user2');
        setTimeout(() => {
            expect(limiter.tryRequest('user2')).toBe(true); // Should allow request after 100ms
            done();
        }, 110);
    });

    it('should block when interpolated total exceeds limit', (done) => {
        const limiter = new SlidingWindowCounter({ windowSize: 1000, limit: 3 });
        limiter.tryRequest('user3'); // 1st request
        limiter.tryRequest('user3'); // 2nd request
        setTimeout(() => {
            limiter.tryRequest('user3'); // 3rd request, currentCount = 3
            expect(limiter.tryRequest('user3')).toBe(false); // Should block 4th request
            done();
        }, 200); // Still within the same window
    });

});