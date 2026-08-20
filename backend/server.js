require('dotenv').config();
const express = require('express');
const noteRoutes = require('./routes/note');
const createRateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = Number.parseInt(process.env.PORT, 10) || 3001;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(origin => origin && origin !== '*');

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '32kb' }));
app.use('/api/note', createRateLimiter(), noteRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`PsycheNote Backend running on http://localhost:${PORT}`);
});
