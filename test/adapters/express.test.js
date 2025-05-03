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

  it('should allow requests within the limit', async () => {
    const res1 = await request(app).get('/');
    const res2 = await request(app).get('/');
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
  });

  it('should block requests over the limit', async () => {
    await request(app).get('/');
    await request(app).get('/');
    const res3 = await request(app).get('/');
    expect(res3.status).toBe(429);
    expect(res3.body.error).toBe('Too Many Requests');
  });

  it('should use custom onBlocked handler', async () => {
    const customApp = express();
    const limiter = new TokenBucket({ capacity: 1, refillRate: 1, refillInterval: 1000 });
    customApp.use(
      expressRateLimiter(limiter, {
        onBlocked: (req, res) => res.status(429).send('Blocked!'),
      })
    );
    customApp.get('/', (req, res) => res.send('OK'));

    await request(customApp).get('/');
    const res2 = await request(customApp).get('/');
    expect(res2.status).toBe(429);
    expect(res2.text).toBe('Blocked!');
  });
});
