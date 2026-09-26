import { describe, it, expect } from 'vitest';
import { normalizeText } from '../lib/extract';

describe('normalizeText', () => {
  it('should trim and normalize whitespace', () => {
    const raw = '  This   is \n a \t test   ';
    expect(normalizeText(raw)).toBe('This is a test');
  });

  it('should remove excessive line breaks but keep basic ones', () => {
    const raw = 'Hello\n\n\n\nWorld';
    expect(normalizeText(raw)).toBe('Hello\n\nWorld');
  });

  it('should return empty string for nullish values', () => {
    expect(normalizeText('')).toBe('');
  });
});
