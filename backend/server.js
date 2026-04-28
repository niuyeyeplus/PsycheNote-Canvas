const express = require('express');
const noteRoutes = require('./routes/note');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use('/api/note', noteRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`PsycheNote Backend running on http://localhost:${PORT}`);
});