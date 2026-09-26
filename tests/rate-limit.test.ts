import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../lib/rate-limit';

describe('Rate Limiter', () => {
  it('should allow requests within limit', () => {
    const ip = '127.0.0.1';
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(true);
  });
});
