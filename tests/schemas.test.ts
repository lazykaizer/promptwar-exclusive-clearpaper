import { describe, it, expect } from 'vitest';
import { AnalyzeRequestSchema } from '../lib/schemas';

describe('schemas', () => {
  it('validates correct document context', () => {
    const valid = {
      text: "hello",
      section: "summary",
      role: 'Tenant',
      language: 'English',
      jurisdiction: 'India',
      docType: 'Rental Agreement'
    };
    expect(AnalyzeRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid context', () => {
    const invalid = {
      role: 123,
      language: 'English'
    };
    expect(AnalyzeRequestSchema.safeParse(invalid).success).toBe(false);
  });
});
