const express = require('express');
const { streamLLMReply } = require('../services/llm');

const router = express.Router();

router.post('/', (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: '便签内容不能为空' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let fullReply = '';
  let moodSent = false;

  streamLLMReply(
    content,
    (mood) => {
      if (!moodSent) {
        res.write(`event: mood\ndata: ${JSON.stringify({ mood })}\n\n`);
        moodSent = true;
      }
    },
    (chunk) => {
      fullReply += chunk;
      res.write(`event: reply\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
    },
    () => {
      // Try to parse the final reply as JSON to extract mood
      try {
        const parsed = JSON.parse(fullReply);
        if (parsed.mood && !moodSent) {
          res.write(`event: mood\ndata: ${JSON.stringify({ mood: parsed.mood })}\n\n`);
        }
      } catch (e) {
        // Not JSON, ignore
      }
      res.end();
    }
  );

  req.on('close', () => {
    res.end();
  });
});

module.exports = router;