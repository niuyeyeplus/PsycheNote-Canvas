import { TextDecoder, TextEncoder } from 'util';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import MoodTestPage from '@/app/page';
import { useMood } from '@/hooks/useMood';
import { useNotes } from '@/hooks/useNotes';

Object.assign(global, { TextDecoder, TextEncoder });

jest.mock('@/hooks/useMood', () => ({
  useMood: jest.fn(),
}));

jest.mock('@/hooks/useNotes', () => ({
  useNotes: jest.fn(),
}));

jest.mock('@/components/CatCompanion', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/FloatingDecorations', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/MoodBackground', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/LLMReplyBubble', () => ({
  __esModule: true,
  default: ({ error, replyText }: { error: string | null; replyText: string }) => (
    <div data-testid="llm-reply">{error || replyText}</div>
  ),
}));

jest.mock('@/components/notes/HistoryModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/notes/NoteGrid', () => ({
  __esModule: true,
  default: () => null,
}));

describe('MoodTestPage', () => {
  const mockedUseMood = useMood as jest.MockedFunction<typeof useMood>;
  const mockedUseNotes = useNotes as jest.MockedFunction<typeof useNotes>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseMood.mockReturnValue({
      currentMood: 'calm',
      setMood: jest.fn(),
      storageError: null,
    });
    mockedUseNotes.mockReturnValue({
      notes: [],
      addNote: jest.fn(),
      deleteNote: jest.fn(),
      storageError: null,
      updateNote: jest.fn(),
    });
  });

  it('保留已有回复时忽略中途无法解析的数据帧', async () => {
    const reader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: {"mood":"开心"}\n\ndata: {"text":"你好"}\n\n'),
        })
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('data: malformed\n\n'),
        })
        .mockResolvedValueOnce({ done: true, value: undefined }),
      cancel: jest.fn().mockResolvedValue(undefined),
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      body: { getReader: () => reader },
    });

    render(<MoodTestPage />);
    fireEvent.click(screen.getByRole('button', { name: '记录下今日的便签吧！' }));
    fireEvent.change(screen.getByPlaceholderText('写下你的心情...'), {
      target: { value: '今天很好' },
    });
    fireEvent.click(screen.getByRole('button', { name: '发送' }));

    await waitFor(() => expect(screen.getByTestId('llm-reply')).toHaveTextContent('你好'));
    expect(screen.getByTestId('llm-reply')).not.toHaveTextContent('回复数据格式异常');
  });
});
