const createRateLimiter = require('./rateLimiter');

describe('rate limiter middleware', () => {
  it('allows requests below the limit and rejects later requests', () => {
    const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60 * 1000 });
    const next = jest.fn();
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { setHeader: jest.fn(), status };
    const req = { ip: '192.0.2.1' };

    limiter(req, res, next);
    limiter(req, res, next);
    limiter(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(status).toHaveBeenCalledWith(429);
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(Number));
    expect(json).toHaveBeenCalledWith({ error: '请求过于频繁，请稍后再试' });
  });

  it('tracks clients independently', () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60 * 1000 });
    const next = jest.fn();
    const res = {
      setHeader: jest.fn(),
      status: jest.fn(() => ({ json: jest.fn() })),
    };

    limiter({ ip: '192.0.2.1' }, res, next);
    limiter({ ip: '192.0.2.2' }, res, next);

    expect(next).toHaveBeenCalledTimes(2);
  });
});
