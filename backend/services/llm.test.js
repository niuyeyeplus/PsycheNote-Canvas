const { EventEmitter } = require('events');

jest.mock('https', () => ({
  request: jest.fn(),
}));

const https = require('https');
const { callLLM, streamLLMReply } = require('./llm');

const createRequest = response => {
  const request = new EventEmitter();
  request.write = jest.fn();
  request.end = jest.fn();
  request.destroy = jest.fn();
  https.request.mockImplementationOnce((options, callback) => {
    process.nextTick(() => callback(response));
    return request;
  });
  return request;
};

const createResponse = statusCode => {
  const response = new EventEmitter();
  response.statusCode = statusCode;
  response.setEncoding = jest.fn();
  return response;
};

describe('llm service', () => {
  beforeEach(() => {
    process.env.MINIMAX_API_KEY = 'test-key';
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.MINIMAX_API_KEY;
  });

  it('should export both LLM functions', () => {
    expect(typeof streamLLMReply).toBe('function');
    expect(typeof callLLM).toBe('function');
  });

  it('reports a missing API key without exiting the process', () => {
    delete process.env.MINIMAX_API_KEY;
    const onError = jest.fn();
    const onDone = jest.fn();

    streamLLMReply('test', jest.fn(), jest.fn(), onDone, onError);

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '缺少 MINIMAX_API_KEY 环境变量，请在 backend/.env 中配置',
      })
    );
    expect(onDone).not.toHaveBeenCalled();
  });

  it('reports non-2xx stream responses through the error callback', done => {
    const response = createResponse(401);
    createRequest(response);
    const onError = jest.fn();

    streamLLMReply('test', jest.fn(), jest.fn(), jest.fn(), onError);

    process.nextTick(() => {
      response.emit('data', '{"error":"unauthorized"}');
      response.emit('end');
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('HTTP 401') })
      );
      done();
    });
  });

  it('reports request errors through the error callback exactly once', done => {
    const response = createResponse(200);
    const request = createRequest(response);
    const onError = jest.fn();
    const onDone = jest.fn();

    streamLLMReply('test', jest.fn(), jest.fn(), onDone, onError);

    process.nextTick(() => {
      request.emit('error', new Error('socket failed'));
      request.emit('error', new Error('socket failed again'));
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onDone).not.toHaveBeenCalled();
      done();
    });
  });

  it('reports a stream with no parseable payload', done => {
    const response = createResponse(200);
    createRequest(response);
    const onError = jest.fn();

    streamLLMReply('test', jest.fn(), jest.fn(), jest.fn(), onError);

    process.nextTick(() => {
      response.emit('data', 'data: {"choices":[]}\n\n');
      response.emit('end');
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('有效回复') })
      );
      done();
    });
  });

  it('rejects callLLM responses with empty content', async () => {
    const response = createResponse(200);
    createRequest(response);

    const promise = callLLM('test');
    process.nextTick(() => {
      response.emit('data', JSON.stringify({ choices: [{ message: {} }] }));
      response.emit('end');
    });

    await expect(promise).rejects.toThrow('有效回复');
  });
});
