import { describe, it, expect, beforeEach } from 'vitest';
import { useDocumentStore } from '../store/useStore';

describe('useDocumentStore', () => {
  beforeEach(() => {
    useDocumentStore.setState({
      extraction: null,
      summary: { status: 'idle', data: null, error: null },
      clauses: { status: 'idle', data: null, error: null },
      obligations: { status: 'idle', data: null, error: null },
      action: { status: 'idle', data: null, error: null },
      chatMessages: [],
    });
  });

  it('should set document text', () => {
    useDocumentStore.getState().setExtraction({ text: 'test text', pageCount: 0, method: 'plain' });
    expect(useDocumentStore.getState().extraction?.text).toBe('test text');
  });

  it('should correctly reset sections', () => {
    useDocumentStore.setState({ clauses: { status: 'done', data: null, error: null } });
    useDocumentStore.getState().resetSection('clauses');
    expect(useDocumentStore.getState().clauses.status).toBe('idle');
  });

  it('should add to chat history', () => {
    useDocumentStore.getState().addChatMessage({ role: 'user', content: 'hello' });
    expect(useDocumentStore.getState().chatMessages.length).toBe(1);
    expect(useDocumentStore.getState().chatMessages[0].content).toBe('hello');
  });
});
