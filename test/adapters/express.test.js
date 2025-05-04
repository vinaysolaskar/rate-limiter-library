const express = require('express');
const request = require('supertest');
const TokenBucket = require('../../src/algorithms/tokenBucket');
const expressRateLimiter = require('../../src/adapters/express');

describe('Express Rate Limiter Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    const limiter = new TokenBucket({ capacity: 2, refillRate: 1, refillInterval: 1000 });
    app.use(expressRateLimiter(limiter));
    app.get('/', (req, res) => res.send('OK'));
  });

  it('blocks requests over the limit', async () => {
    // First two requests allowed
    await request(app).get('/').expect(200);
    await request(app).get('/').expect(200);
    
    // Third request blocked
    await request(app).get('/').expect(429);
  });

  it('uses custom key generator and block handler', async () => {
    const customApp = express();
    const limiter = new TokenBucket({ capacity: 1 });
    
    customApp.use(expressRateLimiter(limiter, {
      keyGenerator: (req) => req.headers['x-api-key'],
      onBlocked: (req, res) => res.status(429).send('Custom Blocked'),
    }));
    
    customApp.get('/', (req, res) => res.send('OK'));
    
    // First request allowed
    await request(customApp)
      .get('/')
      .set('x-api-key', 'secret')
      .expect(200);
    
    // Second request blocked
    await request(customApp)
      .get('/')
      .set('x-api-key', 'secret')
      .expect(429)
      .expect('Custom Blocked');
  });
});
