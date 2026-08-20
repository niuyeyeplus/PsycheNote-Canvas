import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import MoodTestPage from '@/app/page';
import type { Note } from '@/types/note';

const mockFetch = global.fetch as jest.Mock;
const mockGetItem = jest.spyOn(Storage.prototype, 'getItem');
const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');

/** 构造一个 SSE 流式响应，按 chunk 顺序返回数据 */
const createStreamResponse = (chunks: string[], ok = true) => {
  let index = 0;

  return {
    ok,
    body: {
      getReader: () => ({
        read: () => {
          if (index >= chunks.length) {
            return Promise.resolve({ done: true, value: undefined });
          }
          const value = new TextEncoder().encode(chunks[index]);
          index += 1;
          return Promise.resolve({ done: false, value });
        },
      }),
    },
  };
};

const sseEvent = (payload: Record<string, unknown>) => `data: ${JSON.stringify(payload)}\n\n`;

const createNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'note-1',
  content: '已有便签',
  mood: 'happy',
  createdAt: '2026-04-29T10:00:00.000Z',
  ...overrides,
});

const openInput = () => {
  fireEvent.click(screen.getByText('记录下今日的便签吧！'));
};

const typeNote = (text: string) => {
  fireEvent.change(screen.getByPlaceholderText('写下你的心情...'), { target: { value: text } });
};

/** 回复气泡节点（便签卡片中也有同文案的情绪标签与关闭按钮） */
const getBubble = () => document.querySelector('.cloud-bubble') as HTMLElement;

/** localStorage 中便签列表最后一次写入的值 */
const getSavedNotes = (): Note[] => {
  const noteCalls = mockSetItem.mock.calls.filter(([key]) => key === 'psychenote-notes');
  return JSON.parse(noteCalls[noteCalls.length - 1][1]) as Note[];
};

describe('MoodTestPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockReturnValue(null);
  });

  describe('渲染', () => {
    it('应该显示标题和引导文案', () => {
      render(<MoodTestPage />);

      expect(screen.getByText('PsycheNote Canvas')).toBeInTheDocument();
      expect(screen.getByText('你的情绪气象站 · 记录每一刻的心情')).toBeInTheDocument();
    });

    it('没有便签时应该显示空状态', () => {
      render(<MoodTestPage />);

      expect(screen.getByText('还没有便签')).toBeInTheDocument();
    });

    it('应该渲染 localStorage 中已有的便签', () => {
      mockGetItem.mockReturnValue(JSON.stringify([createNote({ content: '恢复的便签' })]));

      render(<MoodTestPage />);

      expect(screen.getByText('恢复的便签')).toBeInTheDocument();
    });
  });

  describe('便签输入弹窗', () => {
    it('点击按钮应该打开输入弹窗', () => {
      render(<MoodTestPage />);

      openInput();

      expect(screen.getByText('记录此刻的心情')).toBeInTheDocument();
    });

    it('点击取消应该关闭弹窗', () => {
      render(<MoodTestPage />);
      openInput();

      fireEvent.click(screen.getByText('取消'));

      expect(screen.queryByText('记录此刻的心情')).not.toBeInTheDocument();
    });

    it('内容为空时发送按钮应该禁用', () => {
      render(<MoodTestPage />);
      openInput();

      expect(screen.getByText('发送')).toBeDisabled();
    });

    it('只有空白字符时发送按钮应该禁用', () => {
      render(<MoodTestPage />);
      openInput();
      typeNote('   ');

      expect(screen.getByText('发送')).toBeDisabled();
    });

    it('输入内容后发送按钮应该可用', () => {
      render(<MoodTestPage />);
      openInput();
      typeNote('今天很开心');

      expect(screen.getByText('发送')).not.toBeDisabled();
    });
  });

  describe('发送便签与流式回复', () => {
    it('应该向后端提交便签内容', async () => {
      mockFetch.mockResolvedValue(createStreamResponse([]));

      render(<MoodTestPage />);
      openInput();
      typeNote('今天很开心');
      fireEvent.click(screen.getByText('发送'));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/note',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ content: '今天很开心' }),
        })
      );
    });

    it('应该根据 mood 事件显示情绪标签，并展示流式回复文本', async () => {
      mockFetch.mockResolvedValue(
        createStreamResponse([sseEvent({ mood: '开心' }), sseEvent({ text: '真好呀' })])
      );

      render(<MoodTestPage />);
      openInput();
      typeNote('今天很开心');
      fireEvent.click(screen.getByText('发送'));

      await waitFor(() => expect(screen.getByText(/真好呀/)).toBeInTheDocument());
      expect(within(getBubble()).getByText('开心')).toBeInTheDocument();
    });

    it('分片到达的回复文本应该被拼接', async () => {
      mockFetch.mockResolvedValue(
        createStreamResponse([
          sseEvent({ mood: '平静' }),
          sseEvent({ text: '慢慢' }),
          sseEvent({ text: '来就好' }),
        ])
      );

      render(<MoodTestPage />);
      openInput();
      typeNote('有点累');
      fireEvent.click(screen.getByText('发送'));

      await waitFor(() => expect(screen.getByText(/慢慢来就好/)).toBeInTheDocument());
    });

    it('流式结束后应该保存便签', async () => {
      mockFetch.mockResolvedValue(createStreamResponse([sseEvent({ mood: '兴奋' })]));

      render(<MoodTestPage />);
      openInput();
      typeNote('明天要去旅行');
      fireEvent.click(screen.getByText('发送'));

      await waitFor(() =>
        expect(mockSetItem).toHaveBeenCalledWith('psychenote-notes', expect.any(String))
      );
      const saved = getSavedNotes();
      expect(saved).toHaveLength(1);
      expect(saved[0]).toMatchObject({ content: '明天要去旅行', mood: 'excited' });
    });

    it('未识别出情绪时不应该保存便签', async () => {
      mockFetch.mockResolvedValue(createStreamResponse([sseEvent({ mood: '未知情绪' })]));

      render(<MoodTestPage />);
      openInput();
      typeNote('随便写点什么');
      fireEvent.click(screen.getByText('发送'));

      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      expect(mockSetItem).not.toHaveBeenCalledWith('psychenote-notes', expect.any(String));
    });

    it('响应失败时不应该显示回复内容', async () => {
      mockFetch.mockResolvedValue(createStreamResponse([sseEvent({ text: '不该出现' })], false));

      render(<MoodTestPage />);
      openInput();
      typeNote('测试失败响应');
      fireEvent.click(screen.getByText('发送'));

      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      expect(screen.queryByText(/不该出现/)).not.toBeInTheDocument();
    });

    it('响应体缺失时不应该崩溃', async () => {
      mockFetch.mockResolvedValue({ ok: true, body: undefined });

      render(<MoodTestPage />);
      openInput();
      typeNote('没有响应体');
      fireEvent.click(screen.getByText('发送'));

      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      expect(screen.getByText('PsycheNote Canvas')).toBeInTheDocument();
    });

    it('非法 JSON 数据行应该被忽略', async () => {
      mockFetch.mockResolvedValue(
        createStreamResponse(['data: not-json\n\n', sseEvent({ text: '正常文本' })])
      );

      render(<MoodTestPage />);
      openInput();
      typeNote('测试脏数据');
      fireEvent.click(screen.getByText('发送'));

      await waitFor(() => expect(screen.getByText(/正常文本/)).toBeInTheDocument());
    });

    it('[DONE] 标记应该被忽略', async () => {
      mockFetch.mockResolvedValue(
        createStreamResponse([sseEvent({ mood: '平静' }), 'data: [DONE]\n\n'])
      );

      render(<MoodTestPage />);
      openInput();
      typeNote('测试结束标记');
      fireEvent.click(screen.getByText('发送'));

      await waitFor(() => expect(within(getBubble()).getByText('平静')).toBeInTheDocument());
    });

    it('请求异常时应该输出错误日志', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockFetch.mockRejectedValue(new Error('network down'));

      render(<MoodTestPage />);
      openInput();
      typeNote('网络异常');
      fireEvent.click(screen.getByText('发送'));

      await waitFor(() =>
        expect(consoleSpy).toHaveBeenCalledWith('Error sending note:', expect.any(Error))
      );
      consoleSpy.mockRestore();
    });

    it('请求被取消时不应该输出错误日志', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const abortError = new Error('aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValue(abortError);

      render(<MoodTestPage />);
      openInput();
      typeNote('取消请求');
      fireEvent.click(screen.getByText('发送'));

      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('点击气泡关闭按钮应该清除情绪标签', async () => {
      mockFetch.mockResolvedValue(
        createStreamResponse([sseEvent({ mood: '开心' }), sseEvent({ text: '开心就好' })])
      );

      render(<MoodTestPage />);
      openInput();
      typeNote('今天很开心');
      fireEvent.click(screen.getByText('发送'));

      await waitFor(() => expect(screen.getByText(/开心就好/)).toBeInTheDocument());
      fireEvent.click(within(getBubble()).getByText('✕'));

      expect(within(getBubble()).queryByText('开心')).not.toBeInTheDocument();
    });
  });

  describe('历史便签弹窗', () => {
    const manyNotes = Array.from({ length: 7 }, (_, i) =>
      createNote({
        id: `note-${i}`,
        content: `便签${i}`,
        createdAt: `2026-04-2${i + 1}T10:00:00.000Z`,
      })
    );

    it('便签超过6条时点击历史按钮应该打开历史弹窗', () => {
      mockGetItem.mockReturnValue(JSON.stringify(manyNotes));

      render(<MoodTestPage />);
      fireEvent.click(screen.getByText('历史便签（7条）'));

      expect(screen.getByText('本周报告')).toBeInTheDocument();
    });

    it('关闭历史弹窗后不应该再显示报告 Tab', () => {
      mockGetItem.mockReturnValue(JSON.stringify(manyNotes));

      render(<MoodTestPage />);
      fireEvent.click(screen.getByText('历史便签（7条）'));
      const modalHeader = screen.getByRole('heading', { name: '历史便签' })
        .parentElement as HTMLElement;
      fireEvent.click(within(modalHeader).getByText('✕'));

      expect(screen.queryByText('本周报告')).not.toBeInTheDocument();
    });
  });

  describe('编辑便签', () => {
    beforeEach(() => {
      mockGetItem.mockReturnValue(JSON.stringify([createNote({ content: '原始内容' })]));
    });

    it('点击便签应该打开编辑弹窗并预填内容', () => {
      render(<MoodTestPage />);

      fireEvent.click(screen.getByText('原始内容'));

      expect(screen.getByText('编辑便签')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('写下你的心情...')).toHaveValue('原始内容');
    });

    it('保存编辑应该更新便签内容', () => {
      render(<MoodTestPage />);
      fireEvent.click(screen.getByText('原始内容'));

      typeNote('修改后的内容');
      fireEvent.click(screen.getByText('保存'));

      expect(screen.queryByText('编辑便签')).not.toBeInTheDocument();
      expect(screen.getByText('修改后的内容')).toBeInTheDocument();
    });

    it('内容为空时保存按钮应该禁用', () => {
      render(<MoodTestPage />);
      fireEvent.click(screen.getByText('原始内容'));

      typeNote('   ');

      expect(screen.getByText('保存')).toBeDisabled();
    });

    it('取消编辑不应该修改便签', () => {
      render(<MoodTestPage />);
      fireEvent.click(screen.getByText('原始内容'));

      typeNote('不会保存的内容');
      fireEvent.click(screen.getByText('取消'));

      expect(screen.getByText('原始内容')).toBeInTheDocument();
      expect(screen.queryByText('不会保存的内容')).not.toBeInTheDocument();
    });

    it('删除便签应该从列表中移除', () => {
      render(<MoodTestPage />);

      fireEvent.click(screen.getByText('✕'));

      expect(screen.queryByText('原始内容')).not.toBeInTheDocument();
      expect(screen.getByText('还没有便签')).toBeInTheDocument();
    });
  });
});
