// Unit tests for llm service

const { EventEmitter } = require('events');

// backend 的 jest 配置未启用 transform，jest.mock 不会被提升，
// 因此必须在 require('https') 之前调用。
jest.mock('https', () => ({ request: jest.fn() }));

process.env.MINIMAX_API_KEY = 'test-api-key';

/* eslint-disable import/order */
const https = require('https');
const { streamLLMReply, callLLM } = require('./llm');
/* eslint-enable import/order */

/** 创建一个可断言写入内容的假请求对象 */
const createMockRequest = () => {
  const req = new EventEmitter();
  req.write = jest.fn();
  req.end = jest.fn();
  return req;
};

/**
 * 拦截 https.request，返回假的 request 对象，
 * 并把 response 回调保存下来供测试驱动。
 */
const mockHttpsRequest = () => {
  const req = createMockRequest();
  let responseCallback;

  https.request.mockImplementation((options, cb) => {
    responseCallback = cb;
    return req;
  });

  return {
    req,
    /** 触发响应，返回可 emit data/end 的假响应对象 */
    respond: () => {
      const res = new EventEmitter();
      responseCallback(res);
      return res;
    },
  };
};

const sseChunk = content => `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n`;

describe('llm service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('模块导出', () => {
    it('should export streamLLMReply function', () => {
      expect(typeof streamLLMReply).toBe('function');
    });

    it('should export callLLM function', () => {
      expect(typeof callLLM).toBe('function');
    });
  });

  describe('API Key 校验', () => {
    it('缺少 MINIMAX_API_KEY 时应该退出进程', () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const originalKey = process.env.MINIMAX_API_KEY;
      delete process.env.MINIMAX_API_KEY;

      jest.isolateModules(() => {
        // eslint-disable-next-line global-require
        require('./llm');
      });

      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(errorSpy).toHaveBeenCalled();

      process.env.MINIMAX_API_KEY = originalKey;
      exitSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe('streamLLMReply', () => {
    it('应该向 MiniMax 接口发送流式请求', () => {
      const { req } = mockHttpsRequest();

      streamLLMReply('今天很开心', jest.fn(), jest.fn(), jest.fn());

      const [options] = https.request.mock.calls[0];
      expect(options).toMatchObject({
        hostname: 'api.minimaxi.com',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
      });
      expect(options.headers.Authorization).toBe('Bearer test-api-key');

      const body = JSON.parse(req.write.mock.calls[0][0]);
      expect(body.stream).toBe(true);
      expect(body.model).toBe('MiniMax-M2');
      expect(body.messages[1].content).toContain('今天很开心');
      expect(req.end).toHaveBeenCalled();
    });

    it('应该把 delta 内容通过 onChunk 回调输出', () => {
      const { respond } = mockHttpsRequest();
      const onChunk = jest.fn();

      streamLLMReply('内容', jest.fn(), onChunk, jest.fn());
      const res = respond();
      res.emit('data', Buffer.from(sseChunk('你好')));

      expect(onChunk).toHaveBeenCalledWith('你好');
    });

    it('应该缓存不完整的行，等到下一个分片再解析', () => {
      const { respond } = mockHttpsRequest();
      const onChunk = jest.fn();

      streamLLMReply('内容', jest.fn(), onChunk, jest.fn());
      const res = respond();
      const chunk = sseChunk('慢慢来');
      res.emit('data', Buffer.from(chunk.slice(0, 20)));

      expect(onChunk).not.toHaveBeenCalled();

      res.emit('data', Buffer.from(chunk.slice(20)));

      expect(onChunk).toHaveBeenCalledWith('慢慢来');
    });

    it('收到 [DONE] 时应该调用 onDone', () => {
      const { respond } = mockHttpsRequest();
      const onDone = jest.fn();

      streamLLMReply('内容', jest.fn(), jest.fn(), onDone);
      const res = respond();
      res.emit('data', Buffer.from('data: [DONE]\n'));

      expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('onDone 只应该被调用一次', () => {
      const { respond } = mockHttpsRequest();
      const onDone = jest.fn();

      streamLLMReply('内容', jest.fn(), jest.fn(), onDone);
      const res = respond();
      res.emit('data', Buffer.from('data: [DONE]\n'));
      res.emit('end');

      expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('响应结束时应该调用 onDone', () => {
      const { respond } = mockHttpsRequest();
      const onDone = jest.fn();

      streamLLMReply('内容', jest.fn(), jest.fn(), onDone);
      const res = respond();
      res.emit('end');

      expect(onDone).toHaveBeenCalledTimes(1);
    });

    it('应该忽略非 data 前缀的行', () => {
      const { respond } = mockHttpsRequest();
      const onChunk = jest.fn();

      streamLLMReply('内容', jest.fn(), onChunk, jest.fn());
      const res = respond();
      res.emit('data', Buffer.from(': keep-alive\nevent: ping\n'));

      expect(onChunk).not.toHaveBeenCalled();
    });

    it('应该忽略非法 JSON 数据行', () => {
      const { respond } = mockHttpsRequest();
      const onChunk = jest.fn();

      streamLLMReply('内容', jest.fn(), onChunk, jest.fn());
      const res = respond();
      res.emit('data', Buffer.from('data: {not json}\n'));

      expect(onChunk).not.toHaveBeenCalled();
    });

    it('delta 内容为空时不应该调用 onChunk', () => {
      const { respond } = mockHttpsRequest();
      const onChunk = jest.fn();

      streamLLMReply('内容', jest.fn(), onChunk, jest.fn());
      const res = respond();
      res.emit('data', Buffer.from(`${sseChunk('')}`));

      expect(onChunk).not.toHaveBeenCalled();
    });

    it('请求出错时应该调用 onDone 并记录日志', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const { req } = mockHttpsRequest();
      const onDone = jest.fn();

      streamLLMReply('内容', jest.fn(), jest.fn(), onDone);
      req.emit('error', new Error('socket closed'));

      expect(onDone).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith('LLM request error:', expect.any(Error));
      errorSpy.mockRestore();
    });
  });

  describe('callLLM', () => {
    it('应该发送非流式请求并返回回复内容', async () => {
      const { req, respond } = mockHttpsRequest();

      const promise = callLLM('今天有点累');
      const res = respond();
      res.emit(
        'data',
        Buffer.from(JSON.stringify({ choices: [{ message: { content: '好好休息' } }] }))
      );
      res.emit('end');

      await expect(promise).resolves.toBe('好好休息');
      expect(JSON.parse(req.write.mock.calls[0][0]).stream).toBeUndefined();
    });

    it('响应缺少 content 时应该返回空字符串', async () => {
      const { respond } = mockHttpsRequest();

      const promise = callLLM('内容');
      const res = respond();
      res.emit('data', Buffer.from(JSON.stringify({ choices: [] })));
      res.emit('end');

      await expect(promise).resolves.toBe('');
    });

    it('响应不是合法 JSON 时应该 reject', async () => {
      const { respond } = mockHttpsRequest();

      const promise = callLLM('内容');
      const res = respond();
      res.emit('data', Buffer.from('not json'));
      res.emit('end');

      await expect(promise).rejects.toThrow();
    });

    it('请求出错时应该 reject', async () => {
      const { req } = mockHttpsRequest();

      const promise = callLLM('内容');
      req.emit('error', new Error('network down'));

      await expect(promise).rejects.toThrow('network down');
    });
  });
});
