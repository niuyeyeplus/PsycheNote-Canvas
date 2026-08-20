const express = require('express');
const { streamLLMReply } = require('../services/llm');

const router = express.Router();

router.post('/', (req, res) => {
  const { content } = req.body;
  if (typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: '便签内容不能为空，且必须是文字' });
  }

  let upstreamRequest;
  let clientClosed = false;

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let moodSent = false;
    let replySent = false;
    let buffer = '';
    let streamFinished = false;

    const canWrite = () => !clientClosed && !res.writableEnded && !res.destroyed;

    const sendMood = mood => {
      if (!moodSent && canWrite()) {
        moodSent = true;
        res.write(`event: mood\ndata: ${JSON.stringify({ mood })}\n\n`);
      }
    };

    const sendChunk = text => {
      if (text && canWrite()) {
        replySent = true;
        res.write(`event: reply\ndata: ${JSON.stringify({ text })}\n\n`);
      }
    };

    const sendError = error => {
      if (streamFinished || !canWrite()) return;
      streamFinished = true;
      const message =
        error instanceof Error && error.message
          ? error.message
          : '暂时无法生成回复，请稍后再试';
      res.write(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    };

    const sendDone = () => {
      if (streamFinished || !canWrite()) return;
      if (!moodSent && !replySent) {
        sendError(new Error('没有收到有效的情绪或回复内容，请稍后再试'));
        return;
      }
      streamFinished = true;
      res.end();
    };

    const processBuffer = () => {
      const thinkEndIdx = buffer.indexOf('</think>');
      if (thinkEndIdx !== -1) {
        buffer = buffer.slice(thinkEndIdx + 7);
      }

      const braceIdx = buffer.indexOf('{');
      if (braceIdx === -1) return;
      if (braceIdx > 0) buffer = buffer.slice(braceIdx);

      let depth = 0;
      for (const character of buffer) {
        if (character === '{') depth++;
        else if (character === '}') depth--;
      }

      if (depth === 0) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.mood && !moodSent) sendMood(parsed.mood);
          if (parsed.reply) sendChunk(parsed.reply);
        } catch (error) {
          console.error('无法解析 LLM 回复:', buffer.slice(0, 300), error);
        }
        buffer = '';
      }
    };

    try {
      upstreamRequest = streamLLMReply(
        content,
        mood => sendMood(mood),
        chunk => {
          buffer += chunk;
          processBuffer();
        },
        () => {
          processBuffer();
          if (buffer.trim()) {
            console.error('LLM 回复在结束时仍有未解析内容:', buffer.slice(0, 300));
          }
          sendDone();
        },
        error => sendError(error)
      );
    } catch (error) {
      sendError(error);
    }

    const abortUpstream = () => {
      if (!res.writableEnded) {
        clientClosed = true;
        upstreamRequest?.abort?.();
      }
    };
    req.on('aborted', abortUpstream);
    req.on('close', abortUpstream);
  } catch (error) {
    console.error('处理便签请求失败:', error);
    if (res.headersSent) {
      if (!res.writableEnded && !res.destroyed) {
        res.write(
          `event: error\ndata: ${JSON.stringify({
            error: '服务器暂时无法处理这条便签，请稍后再试',
          })}\n\n`
        );
        res.end();
      }
    } else {
      res.status(500).json({ error: '服务器暂时无法处理这条便签，请稍后再试' });
    }
  }
});

module.exports = router;
