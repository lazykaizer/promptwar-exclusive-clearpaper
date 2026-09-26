import { describe, it, expect } from 'vitest';
import { documentContextSchema } from '../lib/schemas';

describe('schemas', () => {
  it('validates correct document context', () => {
    const valid = {
      role: 'Tenant',
      language: 'English',
      jurisdiction: 'India',
      docType: 'Rental Agreement'
    };
    expect(documentContextSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid context', () => {
    const invalid = {
      role: 123,
      language: 'English'
    };
    expect(documentContextSchema.safeParse(invalid).success).toBe(false);
  });
});
