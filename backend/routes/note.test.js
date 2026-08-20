// Unit tests for note routes

const express = require('express');

// Mock llm service before requiring router
jest.mock('../services/llm', () => ({
  streamLLMReply: jest.fn(),
}));

const { streamLLMReply } = require('../services/llm');
const noteRouter = require('./note');

describe('note routes', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/note', noteRouter);
  });

  describe('POST /api/note', () => {
    it('should return 400 when content is empty', done => {
      const http = require('http');
      const server = app.listen(0, () => {
        const port = server.address().port;
        const req = http.request(
          {
            hostname: 'localhost',
            port,
            path: '/api/note',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          },
          res => {
            let data = '';
            res.on('data', chunk => {
              data += chunk;
            });
            res.on('end', () => {
              server.close();
              expect(res.statusCode).toBe(400);
              expect(JSON.parse(data)).toEqual({ error: '便签内容不能为空，且必须是文字' });
              done();
            });
          }
        );
        req.write(JSON.stringify({ content: '' }));
        req.end();
      });
    });

    it('should return 400 when content has only whitespace', done => {
      const http = require('http');
      const server = app.listen(0, () => {
        const port = server.address().port;
        const req = http.request(
          {
            hostname: 'localhost',
            port,
            path: '/api/note',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          },
          res => {
            let data = '';
            res.on('data', chunk => {
              data += chunk;
            });
            res.on('end', () => {
              server.close();
              expect(res.statusCode).toBe(400);
              done();
            });
          }
        );
        req.write(JSON.stringify({ content: '   ' }));
        req.end();
      });
    });

    it('should return 400 when content is missing', done => {
      const http = require('http');
      const server = app.listen(0, () => {
        const port = server.address().port;
        const req = http.request(
          {
            hostname: 'localhost',
            port,
            path: '/api/note',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          },
          res => {
            let data = '';
            res.on('data', chunk => {
              data += chunk;
            });
            res.on('end', () => {
              server.close();
              expect(res.statusCode).toBe(400);
              expect(JSON.parse(data)).toEqual({ error: '便签内容不能为空，且必须是文字' });
              done();
            });
          }
        );
        req.write(JSON.stringify({}));
        req.end();
      });
    });

    it('should set SSE headers when content is valid', done => {
      streamLLMReply.mockImplementation((content, onMood, onChunk, onDone) => {
        onDone();
      });

      const http = require('http');
      const server = app.listen(0, () => {
        const port = server.address().port;
        const req = http.request(
          {
            hostname: 'localhost',
            port,
            path: '/api/note',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          },
          res => {
            server.close();
            expect(res.headers['content-type']).toBe('text/event-stream');
            expect(res.headers['cache-control']).toBe('no-cache');
            expect(res.headers['connection']).toBe('keep-alive');
            done();
          }
        );
        req.write(JSON.stringify({ content: 'test content' }));
        req.end();
      });
    });

    it('should call streamLLMReply with content and callbacks', done => {
      streamLLMReply.mockImplementation((content, onMood, onChunk, onDone) => {
        onMood('happy');
        onChunk('{"mood":"开心","reply":"Hello"}');
        onDone();
      });

      const http = require('http');
      const server = app.listen(0, () => {
        const port = server.address().port;

        const req = http.request(
          {
            hostname: 'localhost',
            port,
            path: '/api/note',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          },
          res => {
            res.on('data', () => {});
            res.on('end', () => {
              server.close();
              expect(streamLLMReply).toHaveBeenCalledWith(
                'test content',
                expect.any(Function),
                expect.any(Function),
                expect.any(Function),
                expect.any(Function)
              );
              done();
            });
          }
        );
        req.write(JSON.stringify({ content: 'test content' }));
        req.end();
      });
    });

    it('should return 200 for valid content', done => {
      streamLLMReply.mockImplementation((content, onMood, onChunk, onDone) => {
        onMood('calm');
        onDone();
      });

      const http = require('http');
      const server = app.listen(0, () => {
        const port = server.address().port;
        const req = http.request(
          {
            hostname: 'localhost',
            port,
            path: '/api/note',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          },
          res => {
            server.close();
            expect(res.statusCode).toBe(200);
            done();
          }
        );
        req.write(JSON.stringify({ content: 'valid content here' }));
        req.end();
      });
    });

    it('should emit an SSE error event when the LLM fails', done => {
      streamLLMReply.mockImplementation((content, onMood, onChunk, onDone, onError) => {
        onError(new Error('LLM 服务暂时不可用'));
      });

      const http = require('http');
      const server = app.listen(0, () => {
        const port = server.address().port;
        const req = http.request(
          {
            hostname: 'localhost',
            port,
            path: '/api/note',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          },
          res => {
            let data = '';
            res.on('data', chunk => {
              data += chunk;
            });
            res.on('end', () => {
              server.close();
              expect(data).toContain('event: error');
              expect(data).toContain('LLM 服务暂时不可用');
              done();
            });
          }
        );
        req.write(JSON.stringify({ content: 'error content' }));
        req.end();
      });
    });

    it('should emit an SSE error event when the LLM returns no payload', done => {
      streamLLMReply.mockImplementation((content, onMood, onChunk, onDone) => {
        onDone();
      });

      const http = require('http');
      const server = app.listen(0, () => {
        const port = server.address().port;
        const req = http.request(
          {
            hostname: 'localhost',
            port,
            path: '/api/note',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          },
          res => {
            let data = '';
            res.on('data', chunk => {
              data += chunk;
            });
            res.on('end', () => {
              server.close();
              expect(data).toContain('event: error');
              done();
            });
          }
        );
        req.write(JSON.stringify({ content: 'empty response' }));
        req.end();
      });
    });
  });
});
