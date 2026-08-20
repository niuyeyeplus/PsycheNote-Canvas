require('dotenv').config();
const express = require('express');
const noteRoutes = require('./routes/note');

const app = express();
const PORT = 3001;

// CORS: allow frontend dev server
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use('/api/note', noteRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: '请求的接口不存在' });
});

app.use((error, req, res, next) => {
  console.error('Express 请求处理失败:', error);
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    res.status(400).json({ error: '请求体不是有效的 JSON' });
    return;
  }
  res.status(500).json({ error: '服务器内部错误，请稍后再试' });
});

process.on('unhandledRejection', reason => {
  console.error('未处理的 Promise 拒绝:', reason);
});

process.on('uncaughtException', error => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

if (require.main === module) {
  if (!process.env.MINIMAX_API_KEY) {
    console.error('警告：缺少 MINIMAX_API_KEY 环境变量，LLM 请求将无法处理。');
  }

  app.listen(PORT, () => {
    console.log(`PsycheNote Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
