const express = require('express');
const RedisStore = require('../src/storage/redis');
const MemoryStore = require('../src/storage/memory');
const TokenBucket = require('../src/algorithms/tokenBucket');
const expressRateLimiter = require('../src/adapters/express');

// 1. Create a Redis client (use your Redis Cloud connection string or localhost)
const redisOptions = {
  host: 'redis-18042.c57.us-east-1-4.ec2.redns.redis-cloud.com', // replace with your Redis Cloud host if needed
  port: 18042,        // replace with your Redis Cloud port if needed
  username: 'default',
  password: 'OwJNYg2LlQdJcT5bP2DPOHeFViFnTAK2'       // set your Redis Cloud password if needed
};
const redisStore = new RedisStore(redisOptions);
const memoryStore = new MemoryStore();

// Listen for Redis errors and fall back to MemoryStore
redisStore.client.on('error', (err) => {
  console.error('Redis error:', err);
  limiter.store = memoryStore;
});

// 2. Create a Token Bucket rate limiter per IP
const limiter = new TokenBucket({
  capacity: 5,             // Max 5 requests
  refillRate: 1,           // Refill 1 token per second
  refillInterval: 1000,    // Refill every 1000ms
  store: redisStore        // Use Redis for persistence
});

// 3. Create Express app
const app = express();

// Optional: Log the client IP for debugging
app.use((req, res, next) => {
  console.log('Client IP:', req.ip);
  next();
});

// 4. Apply rate limiting middleware (per IP)
app.use(expressRateLimiter(limiter, {
  keyGenerator: (req) => req.ip, // Rate limit by IP
  onBlocked: (req, res) => res.status(429).json({ message: 'Too many requests' }),
  logger: console // or your custom logger
}));

// 5. Example endpoint
app.get('/', (req, res) => {
  res.send('Hello! This endpoint is rate limited per IP using Redis-backed Token Bucket.');
});

// 6. Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
