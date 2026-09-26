import { describe, it, expect, beforeEach } from 'vitest';
import { useDocumentStore, useCompareStore } from '../store/useStore';

describe('useDocumentStore', () => {
  beforeEach(() => {
    useDocumentStore.getState().clearSession();
  });

  it('should initialize with null extraction', () => {
    expect(useDocumentStore.getState().extraction).toBeNull();
  });

  it('should set extraction data', () => {
    useDocumentStore.getState().setExtraction({
      text: 'test text',
      pageCount: 2,
      method: 'text-layer',
      warnings: ['test warning'],
    });
    const state = useDocumentStore.getState();
    expect(state.extraction?.text).toBe('test text');
    expect(state.extraction?.pageCount).toBe(2);
    expect(state.extraction?.method).toBe('text-layer');
  });

  it('should update context partially', () => {
    useDocumentStore.getState().setContext({ role: 'Tenant' });
    expect(useDocumentStore.getState().context.role).toBe('Tenant');
    expect(useDocumentStore.getState().context.language).toBe('English'); // unchanged
  });

  it('should set section to loading state', () => {
    useDocumentStore.getState().setSectionLoading('summary');
    expect(useDocumentStore.getState().summary.status).toBe('loading');
    expect(useDocumentStore.getState().summary.error).toBeNull();
  });

  it('should set section data', () => {
    const mockData = { is_legal_document: true, doc_type: 'Rental' };
    useDocumentStore.getState().setSectionData('summary', mockData);
    expect(useDocumentStore.getState().summary.status).toBe('done');
    expect(useDocumentStore.getState().summary.data).toEqual(mockData);
  });

  it('should set section error', () => {
    useDocumentStore.getState().setSectionError('clauses', 'Failed to load');
    expect(useDocumentStore.getState().clauses.status).toBe('error');
    expect(useDocumentStore.getState().clauses.error).toBe('Failed to load');
  });

  it('should reset a section to idle', () => {
    useDocumentStore.getState().setSectionData('obligations', { obligations: [] });
    useDocumentStore.getState().resetSection('obligations');
    expect(useDocumentStore.getState().obligations.status).toBe('idle');
    expect(useDocumentStore.getState().obligations.data).toBeNull();
  });

  it('should add chat messages with max limit of 16', () => {
    for (let i = 0; i < 20; i++) {
      useDocumentStore.getState().addChatMessage({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `msg-${i}`,
      });
    }
    // Should keep only last 16
    expect(useDocumentStore.getState().chatMessages.length).toBe(16);
    expect(useDocumentStore.getState().chatMessages[0].content).toBe('msg-4');
  });

  it('should clear chat messages', () => {
    useDocumentStore.getState().addChatMessage({ role: 'user', content: 'hi' });
    useDocumentStore.getState().clearChat();
    expect(useDocumentStore.getState().chatMessages).toEqual([]);
  });

  it('should toggle checklist state', () => {
    useDocumentStore.getState().toggleChecklist('item-1');
    expect(useDocumentStore.getState().checklistState['item-1']).toBe(true);
    useDocumentStore.getState().toggleChecklist('item-1');
    expect(useDocumentStore.getState().checklistState['item-1']).toBe(false);
  });

  it('should set and clear active tab', () => {
    useDocumentStore.getState().setActiveTab('clauses');
    expect(useDocumentStore.getState().activeTab).toBe('clauses');
  });

  it('should set simple summary toggle', () => {
    useDocumentStore.getState().setShowSimpleSummary(true);
    expect(useDocumentStore.getState().showSimpleSummary).toBe(true);
  });

  it('should manage highlights', () => {
    const highlight = {
      quoteText: 'test',
      status: 'verified' as const,
      startOffset: 0,
      endOffset: 4,
      sourceId: 'clause-1',
    };
    useDocumentStore.getState().addHighlight(highlight);
    expect(useDocumentStore.getState().highlights).toHaveLength(1);
    useDocumentStore.getState().setActiveHighlight('clause-1');
    expect(useDocumentStore.getState().activeHighlightId).toBe('clause-1');
  });

  it('should replace duplicate highlight by sourceId', () => {
    const h1 = { quoteText: 'a', status: 'verified' as const, startOffset: 0, endOffset: 1, sourceId: 'c1' };
    const h2 = { quoteText: 'b', status: 'verified' as const, startOffset: 2, endOffset: 3, sourceId: 'c1' };
    useDocumentStore.getState().addHighlight(h1);
    useDocumentStore.getState().addHighlight(h2);
    expect(useDocumentStore.getState().highlights).toHaveLength(1);
    expect(useDocumentStore.getState().highlights[0].quoteText).toBe('b');
  });

  it('should fully clear session', () => {
    useDocumentStore.getState().setExtraction({ text: 'x', pageCount: 0, method: 'plain', warnings: [] });
    useDocumentStore.getState().addChatMessage({ role: 'user', content: 'test' });
    useDocumentStore.getState().setActiveTab('action');
    useDocumentStore.getState().clearSession();
    const state = useDocumentStore.getState();
    expect(state.extraction).toBeNull();
    expect(state.chatMessages).toEqual([]);
    expect(state.activeTab).toBe('overview');
  });
});

describe('useCompareStore', () => {
  beforeEach(() => {
    useCompareStore.getState().clearSession();
  });

  it('should initialize with null extractions', () => {
    const state = useCompareStore.getState();
    expect(state.extractionA).toBeNull();
    expect(state.extractionB).toBeNull();
  });

  it('should set labels', () => {
    useCompareStore.getState().setLabel('A', 'Contract v1');
    expect(useCompareStore.getState().labelA).toBe('Contract v1');
  });

  it('should set extraction and derive text', () => {
    useCompareStore.getState().setExtraction('B', {
      text: 'doc b',
      pageCount: 1,
      method: 'plain',
      warnings: [],
    });
    expect(useCompareStore.getState().textB).toBe('doc b');
  });

  it('should track result loading states', () => {
    useCompareStore.getState().setResultLoading();
    expect(useCompareStore.getState().result.status).toBe('loading');

    useCompareStore.getState().setResultError('Something failed');
    expect(useCompareStore.getState().result.status).toBe('error');
    expect(useCompareStore.getState().result.error).toBe('Something failed');
  });

  it('should clear compare session', () => {
    useCompareStore.getState().setLabel('A', 'X');
    useCompareStore.getState().clearSession();
    expect(useCompareStore.getState().labelA).toBe('Document A');
  });
});
