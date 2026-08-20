const http = require('http');

const app = require('./server');

const request = (path, body) =>
  new Promise(resolve => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      const req = http.request(
        {
          hostname: 'localhost',
          port,
          path,
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
            resolve({ body: JSON.parse(data), statusCode: res.statusCode });
          });
        }
      );
      req.write(body);
      req.end();
    });
  });

describe('server error handling', () => {
  it('returns a JSON 400 for malformed request bodies', async () => {
    await expect(request('/api/note', '{"content":')).resolves.toEqual({
      body: { error: '请求体不是有效的 JSON' },
      statusCode: 400,
    });
  });

  it('returns a JSON 404 for unknown routes', async () => {
    await expect(request('/api/unknown', '{}')).resolves.toEqual({
      body: { error: '请求的接口不存在' },
      statusCode: 404,
    });
  });
});
