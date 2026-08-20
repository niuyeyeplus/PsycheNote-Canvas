const createRateLimiter = ({
  maxRequests = 20,
  windowMs = 60 * 1000,
} = {}) => {
  const windows = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const currentWindow = windows.get(key);

    for (const [clientKey, clientWindow] of windows) {
      if (now >= clientWindow.resetAt) {
        windows.delete(clientKey);
      }
    }

    if (!currentWindow || now >= currentWindow.resetAt) {
      windows.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (currentWindow.count >= maxRequests) {
      const retryAfter = Math.max(
        1,
        Math.ceil((currentWindow.resetAt - now) / 1000)
      );
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
    }

    currentWindow.count += 1;
    return next();
  };
};

module.exports = createRateLimiter;
