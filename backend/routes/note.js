const express = require('express');
const { streamLLMReply } = require('../services/llm');

const router = express.Router();

router.post('/', (req, res) => {
  const { content } = req.body || {};
  if (
    content === undefined ||
    content === null ||
    (typeof content === 'string' && !content.trim())
  ) {
    return res.status(400).json({ error: '便签内容不能为空' });
  }
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'content must be a string' });
  }

  const trimmedContent = content.trim();
  if (trimmedContent.length > 2000) {
    return res
      .status(400)
      .json({ error: 'content must be 2000 characters or fewer' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let moodSent = false;
  let buffer = '';

  const sendMood = mood => {
    if (moodSent) return;
    moodSent = true;
    res.write(`event: mood\ndata: ${JSON.stringify({ mood })}\n\n`);
  };

  const sendChunk = text => {
    res.write(`event: reply\ndata: ${JSON.stringify({ text })}\n\n`);
  };

  const sendDone = () => {
    res.end();
  };

  const processBuffer = () => {
    // Find the first complete thinking block end tag
    const thinkEndIdx = buffer.indexOf('</think>');
    if (thinkEndIdx !== -1) {
      // Discard everything up to and including the closing tag
      buffer = buffer.slice(thinkEndIdx + 7);
    }

    // Now look for the opening brace of JSON
    const braceIdx = buffer.indexOf('{');
    if (braceIdx === -1) {
      // No JSON yet
      return;
    }
    if (braceIdx > 0) {
      buffer = buffer.slice(braceIdx);
    }

    // Count braces to know if JSON is complete
    let depth = 0;
    for (const ch of buffer) {
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
    }

    if (depth === 0) {
      try {
        const parsed = JSON.parse(buffer);
        if (parsed.mood && !moodSent) {
          sendMood(parsed.mood);
        }
        if (parsed.reply) {
          sendChunk(parsed.reply);
        }
      } catch (e) {
        // Invalid JSON
      }
      buffer = '';
    }
  };

  streamLLMReply(
    trimmedContent,
    mood => sendMood(mood),
    chunk => {
      buffer += chunk;
      processBuffer();
    },
    () => sendDone()
  );

  req.on('close', () => {});
});

module.exports = router;
