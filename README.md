# Rate Limiting Library

A modular, extensible rate limiter for Node.js APIs.  
Currently supports the Token Bucket algorithm with in-memory storage.  
Designed for easy integration, customization, and future expansion (Redis support, logging, more algorithms).

---

## Features

- Token Bucket rate limiting algorithm
- Per-user/IP rate limiting (by key)
- In-memory storage (fast, simple)
- Easy to use in any Node.js backend
- Ready for middleware integration (Express adapter coming soon)
- Unit tested

---

## Installation

- npm install rate-limiting-library

---

## 🛠️ Usage

### Basic Example
Token Bucket
- Code: 
- {
    - const TokenBucket = require('./src/algorithms/tokenBucket');
    - const limiter = new TokenBucket({ capacity: 10, refillRate: 2, refillInterval: 1000 });

    - // Example: Check if a user (by key) can make a request
    - const userKey = 'user123';
    - if (limiter.tryRemoveToken(userKey)) {
    - // Allow request
    - } else {
    - // Block request (rate limited)
    - }
- }

---

### Sliding Window Counter Example

- Code: 
- {
    - const SlidingWindowCounter = require('./src/algorithms/slidingWindowCounter');
    - const limiter = new SlidingWindowCounter({ windowSize: 60000, limit: 100 }); // 100 requests per minute
    - const userKey = 'user456';
    - if (limiter.tryRequest(userKey)) {// Allow request}
    - else {// Block request (rate limited)}
- }

---

## API

### `TokenBucket` Class

**Constructor:**

new TokenBucket({ capacity, refillRate, refillInterval })
- `capacity` (number): max tokens in the bucket (default: 10)
- `refillRate` (number): tokens added per interval (default: 1)
- `refillInterval` (ms): interval in milliseconds to add tokens (default: 1000)

---

### SlidingWindowCounter Class

**Constructor:**

new SlidingWindowCounter({ windowSize, limit })
- `windowSize` (ms): Size of the sliding window in milliseconds (default: 60000)
- `limit` (number): Max requests allowed per window (default: 100)

#### Methods

- `tryRemoveToken(key)`:  
  Returns `true` if the request is allowed (token removed), `false` if rate limited.
- `getTokens(key)`:  
  Returns the current number of tokens for a key.

Sliding Window: 
- `tryRequest(key)`: Returns `true` if the request is allowed, `false` if rate limited.

---

## Testing

Run tests with [Jest](https://jestjs.io/):


---

## Roadmap

- [x] Token Bucket algorithm (in-memory)
- [X] Sliding Window Counter algorithm
- [ ] Pluggable storage (Redis, file, etc.)
- [ ] Logging support
- [ ] Express/Nest/Fastify middleware adapters
- [ ] Advanced configuration (per-route, per-user)
- [ ] Comprehensive documentation & examples

## 👨‍💻 Author

Vinay Solaskar  
[GitHub](https://github.com/vinaysolaskar) | [LinkedIn](https://www.linkedin.com/in/vinay-solaskar-a61b0125b/)
