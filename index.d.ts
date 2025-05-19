export interface TokenBucketOptions {
  capacity?: number;
  refillRate?: number;
  refillInterval?: number;
  store?: any;
}

export class TokenBucket {
  constructor(options?: TokenBucketOptions);
  tryRemoveToken(key?: string): Promise<boolean>;
  getTokens(key?: string): Promise<number>;
}

export interface SlidingWindowCounterOptions {
  windowSize?: number;
  limit?: number;
  store?: any;
}

export class SlidingWindowCounter {
  constructor(options?: SlidingWindowCounterOptions);
  tryRequest(key?: string): Promise<boolean>;
}

export class MemoryStore {
  constructor();
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
}

// If you have RedisStore or expressRateLimiter, add their types here as well.