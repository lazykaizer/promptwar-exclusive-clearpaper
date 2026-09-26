import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, getClientIP } from '../lib/rate-limit';

describe('checkRateLimit', () => {
  it('should allow the first request from a new IP', () => {
    const result = checkRateLimit('192.168.1.100');
    expect(result.allowed).toBe(true);
    expect(result.retryAfterSeconds).toBe(0);
  });

  it('should allow multiple requests within the per-minute limit', () => {
    const ip = '10.0.0.1';
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(ip);
      expect(result.allowed).toBe(true);
    }
  });

  it('should block requests exceeding the per-minute limit', () => {
    const ip = '10.0.0.2';
    // Exhaust all 20 per-minute requests
    for (let i = 0; i < 20; i++) {
      checkRateLimit(ip);
    }
    const blocked = checkRateLimit(ip);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('should track different IPs independently', () => {
    const ip1 = '172.16.0.1';
    const ip2 = '172.16.0.2';
    // Exhaust ip1
    for (let i = 0; i < 20; i++) {
      checkRateLimit(ip1);
    }
    // ip2 should still be allowed
    const result = checkRateLimit(ip2);
    expect(result.allowed).toBe(true);
  });

  it('should return retryAfterSeconds as a positive integer when blocked', () => {
    const ip = '10.0.0.3';
    for (let i = 0; i < 20; i++) {
      checkRateLimit(ip);
    }
    const result = checkRateLimit(ip);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
    expect(Number.isInteger(Math.ceil(result.retryAfterSeconds))).toBe(true);
  });
});

describe('getClientIP', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIP(request)).toBe('1.2.3.4');
  });

  it('should return "unknown" when no forwarded header exists', () => {
    const request = new Request('http://localhost');
    expect(getClientIP(request)).toBe('unknown');
  });

  it('should trim whitespace from IP addresses', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '  9.8.7.6  , 5.4.3.2' },
    });
    expect(getClientIP(request)).toBe('9.8.7.6');
  });
});
