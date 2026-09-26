import { describe, it, expect } from 'vitest';
import {
  AnalyzeRequestSchema,
  ChatRequestSchema,
  CompareRequestSchema,
  SummarySchema,
  ClausesResultSchema,
  ObligationsResultSchema,
  ActionPlanSchema,
  ChatAnswerSchema,
  RiskSchema,
  CategorySchema,
  LanguageSchema,
  RoleSchema,
  JurisdictionSchema,
} from '../lib/schemas';

describe('AnalyzeRequestSchema', () => {
  it('validates a complete valid request', () => {
    const valid = {
      text: 'This is a legal document.',
      section: 'summary',
      role: 'Tenant',
      language: 'English',
      jurisdiction: 'India',
      docType: 'Rental Agreement',
    };
    expect(AnalyzeRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects missing required text field', () => {
    const invalid = { section: 'summary' };
    expect(AnalyzeRequestSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects invalid section value', () => {
    const invalid = { text: 'hello', section: 'unknown' };
    expect(AnalyzeRequestSchema.safeParse(invalid).success).toBe(false);
  });

  it('applies defaults for optional fields', () => {
    const minimal = { text: 'hello', section: 'clauses' };
    const result = AnalyzeRequestSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe('Other');
      expect(result.data.language).toBe('English');
      expect(result.data.jurisdiction).toBe('India');
    }
  });

  it('rejects text exceeding max length', () => {
    const tooLong = { text: 'a'.repeat(600001), section: 'summary' };
    expect(AnalyzeRequestSchema.safeParse(tooLong).success).toBe(false);
  });
});

describe('ChatRequestSchema', () => {
  it('validates a valid chat request', () => {
    const valid = {
      text: 'document text',
      messages: [{ role: 'user', content: 'What is the lock-in period?' }],
    };
    expect(ChatRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects too many messages', () => {
    const messages = Array.from({ length: 17 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `msg ${i}`,
    }));
    const invalid = { text: 'doc', messages };
    expect(ChatRequestSchema.safeParse(invalid).success).toBe(false);
  });
});

describe('CompareRequestSchema', () => {
  it('validates a valid comparison request', () => {
    const valid = {
      textA: 'Document A content',
      textB: 'Document B content',
    };
    expect(CompareRequestSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects when textB is missing', () => {
    const invalid = { textA: 'only one doc' };
    expect(CompareRequestSchema.safeParse(invalid).success).toBe(false);
  });
});

describe('SummarySchema', () => {
  it('parses a minimal valid summary with catch defaults', () => {
    const result = SummarySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_legal_document).toBe(true);
      expect(result.data.doc_type).toBe('Unknown');
      expect(result.data.overall_risk).toBe('low');
    }
  });

  it('handles parties as string array', () => {
    const data = { parties: ['Alice', 'Bob'] };
    const result = SummarySchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parties[0]).toEqual({ name: 'Alice', role: 'Unknown' });
    }
  });
});

describe('ClausesResultSchema', () => {
  it('parses empty clauses gracefully', () => {
    const result = ClausesResultSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.clauses).toEqual([]);
    }
  });

  it('parses valid clause data', () => {
    const data = {
      clauses: [{
        id: 'c1',
        title: 'Termination',
        category: 'termination',
        risk: 'high',
        quote: 'Either party may terminate...',
        plain_explanation: 'You can end the contract.',
        why_it_matters: 'Important for exit planning.',
      }],
    };
    const result = ClausesResultSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.clauses).toHaveLength(1);
      expect(result.data.clauses[0].risk).toBe('high');
    }
  });
});

describe('ActionPlanSchema', () => {
  it('parses empty action plan gracefully', () => {
    const result = ActionPlanSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.red_flags).toEqual([]);
      expect(result.data.checklist).toEqual([]);
    }
  });
});

describe('ChatAnswerSchema', () => {
  it('parses a valid chat answer', () => {
    const data = {
      answer: 'The lock-in period is 12 months.',
      confidence: 'clear',
      citations: [{ quote: '12-month lock-in' }],
    };
    const result = ChatAnswerSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.answer).toBe('The lock-in period is 12 months.');
      expect(result.data.suggest_lawyer).toBe(false);
    }
  });

  it('handles citations as plain strings', () => {
    const data = {
      answer: 'Answer here',
      citations: ['some quote text'],
    };
    const result = ChatAnswerSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.citations[0]).toEqual({ quote: 'some quote text' });
    }
  });
});

describe('Primitive enums', () => {
  it('validates risk levels', () => {
    expect(RiskSchema.safeParse('high').success).toBe(true);
    expect(RiskSchema.safeParse('critical').success).toBe(false);
  });

  it('validates categories', () => {
    expect(CategorySchema.safeParse('payment').success).toBe(true);
    expect(CategorySchema.safeParse('unknown_cat').success).toBe(false);
  });

  it('validates languages', () => {
    expect(LanguageSchema.safeParse('Hindi').success).toBe(true);
    expect(LanguageSchema.safeParse('French').success).toBe(false);
  });

  it('validates roles', () => {
    expect(RoleSchema.safeParse('Tenant').success).toBe(true);
    expect(RoleSchema.safeParse('Admin').success).toBe(false);
  });

  it('validates jurisdictions', () => {
    expect(JurisdictionSchema.safeParse('India').success).toBe(true);
    expect(JurisdictionSchema.safeParse('USA').success).toBe(false);
  });
});
