# Rate Limiting Library

A modular, extensible rate limiter for Node.js APIs.  
Currently supports the Token Bucket algorithm with in-memory storage.  
Designed for easy integration, customization, and future expansion (Redis support, logging, more algorithms).

---

## Features

- Token Bucket rate limiting algorithm
- Sliding Window Counter rate limiting algorithm
- Per-user/IP rate limiting (by key)
- In-memory storage (fast, simple)
- Easy to use in any Node.js backend
- Express middleware adapter for seamless integration
- Unit tested
- **Well-tested** with edge cases and error handling
- **Graceful fallback** to in-memory storage on Redis failure

---

## Installation

[![npm version](https://img.shields.io/npm/v/rate-limiter-library.svg)](https://www.npmjs.com/package/rate-limiter-library)

```sh
npm install rate-limiter-library
npm install express ioredis
```

---

## 🛠️ Usage

### Basic Example
Token Bucket
- Code:
```js
{
   const TokenBucket = require('./src/algorithms/tokenBucket');
   const limiter = new TokenBucket({ capacity: 10, refillRate: 2, refillInterval: 1000 });

   // Example: Check if a user (by key) can make a request
   const userKey = 'user123';
   if (limiter.tryRemoveToken(userKey)) {
   // Allow request
   } else {
   // Block request (rate limited)
   }
}
```

---

### Sliding Window Counter Example

- Code: 
```js
{
   const SlidingWindowCounter = require('./src/algorithms/slidingWindowCounter');
   const limiter = new SlidingWindowCounter({ windowSize: 60000, limit: 100 }); // 100 requests per minute
   const userKey = 'user456';
   if (limiter.tryRequest(userKey)) {/*Allow request*/}
   else { /*Block request (rate limited)*/}
}
```

---

### Express Middleware Usage

- Code:
```js
{
     const express = require('express');
     const TokenBucket = require('rate-limiter-library');
     const expressRateLimiter = require('rate-limiter-library');
     const limiter = new TokenBucket({ capacity: 5, refillRate: 1, refillInterval: 1000 });
     const app = express();

     app.use(
     expressRateLimiter(limiter, {
        keyGenerator: (req) => req.headers['x-api-key'] || req.ip, // Custom key extraction
        logger: console, // Any logger with info/warn methods
        onBlocked: (req, res) => res.status(429).send('Custom: Too Many Requests'), // Custom block response
     })
     );

     app.get('/', (req, res) => res.send('Hello, world!'));
     app.listen(3000, () => console.log('Server running on port 3000'));
}
``` 

### Memory Abstraction - In Memory + Redis
1. Using Redis as the Store
- See [`examples/express-example.js`](./examples/express-example.js) for a complete example.

2. Using In-Memory Store
- Just omit the Redis options and pass `new MemoryStore()` as the store.

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

### Express Middleware Adapter

**Function:**
expressRateLimiter(limiter, options)

text
- `limiter`: Instance of TokenBucket or SlidingWindowCounter
- `options` (object):
  - `keyGenerator`: Function to extract key from request (default: `req.ip`)
  - `onBlocked`: Function to handle blocked requests (default: 429 JSON)
  - `logger`: Logger object (default: `console`)

---

## Testing

Basic Test:
```sh
  npm test
```
Run tests with [Jest](https://jestjs.io/):


---

## 🗺️ Roadmap

- [x] Token Bucket algorithm (in-memory)
- [x] Sliding Window Counter algorithm (in-memory)
- [x] Express middleware adapter
- [x] Logging support
- [X] Pluggable storage (Redis, file, etc.)
- [ ] Per-route/per-user advanced configuration
- [ ] Middleware adapters for Nest/Fastify
- [ ] Comprehensive documentation & more examples

## 👨‍💻 Author

Vinay Solaskar  
[GitHub](https://github.com/vinaysolaskar) | [LinkedIn](https://www.linkedin.com/in/vinay-solaskar-a61b0125b/)
