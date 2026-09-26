import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store/useStore';

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({
      documentText: '',
      isLegalDocument: null,
      summary: null,
      clauses: null,
      obligations: null,
      actionPlan: null,
      chatHistory: [],
      error: null,
      fileName: '',
      fileType: '',
    });
  });

  it('should set document text', () => {
    useStore.getState().setDocumentText('test text', 'test.pdf', 'application/pdf');
    expect(useStore.getState().documentText).toBe('test text');
    expect(useStore.getState().fileName).toBe('test.pdf');
  });

  it('should correctly reset sections', () => {
    useStore.setState({ clauses: { status: 'done', data: [] } });
    useStore.getState().resetSection('clauses');
    expect(useStore.getState().clauses.status).toBe('idle');
    expect(useStore.getState().clauses.data).toBeNull();
  });

  it('should add to chat history', () => {
    useStore.getState().addChatMessage({ role: 'user', content: 'hello' });
    expect(useStore.getState().chatHistory.length).toBe(1);
    expect(useStore.getState().chatHistory[0].content).toBe('hello');
  });
});
