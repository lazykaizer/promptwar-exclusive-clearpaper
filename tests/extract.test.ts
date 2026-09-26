import { describe, it, expect } from 'vitest';
import { normalizeText, processPastedText } from '../lib/extract';

describe('normalizeText', () => {
  it('should trim leading and trailing whitespace', () => {
    expect(normalizeText('  hello world  ')).toBe('hello world');
  });

  it('should convert \\r\\n to \\n', () => {
    expect(normalizeText('line1\r\nline2')).toBe('line1\nline2');
  });

  it('should convert standalone \\r to \\n', () => {
    expect(normalizeText('line1\rline2')).toBe('line1\nline2');
  });

  it('should convert tabs to double spaces', () => {
    expect(normalizeText('a\tb')).toBe('a  b');
  });

  it('should trim trailing spaces per line', () => {
    expect(normalizeText('hello   \nworld   ')).toBe('hello\nworld');
  });

  it('should collapse 4+ consecutive newlines to 3', () => {
    expect(normalizeText('A\n\n\n\n\nB')).toBe('A\n\n\nB');
  });

  it('should return empty string for empty input', () => {
    expect(normalizeText('')).toBe('');
  });

  it('should preserve exactly 3 consecutive newlines', () => {
    expect(normalizeText('A\n\n\nB')).toBe('A\n\n\nB');
  });
});

describe('processPastedText', () => {
  it('should return normalized text with plain method', () => {
    const result = processPastedText('  Hello   World  ');
    expect(result.text).toBe('Hello   World');
    expect(result.method).toBe('plain');
    expect(result.pageCount).toBe(0);
    expect(result.warnings).toEqual([]);
  });

  it('should add truncation warning for very long text', () => {
    const longText = 'a'.repeat(200000);
    const result = processPastedText(longText);
    expect(result.text.length).toBe(150000);
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0]).toContain('trimmed');
  });

  it('should handle text exactly at the limit', () => {
    const exactText = 'a'.repeat(150000);
    const result = processPastedText(exactText);
    expect(result.text.length).toBe(150000);
    expect(result.warnings).toEqual([]);
  });
});
