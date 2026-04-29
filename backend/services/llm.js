const https = require('https');

const API_KEY =
  'sk-cp-k8d7Dscc2uxkA8MkDBwjBSVf_jbJie1sn5sxC0XMxLin1JEd1UwOXBulTxisATWVkgOKmdIc4CN9oYUMGc-goZhOA0OmFP6B_tfbqqek7YFS3TZ6iGwpIa4';
const BASE_URL = 'api.minimaxi.com';
const MODEL = 'MiniMax-M2';

const SYSTEM_PROMPT = `你是一名温柔治愈、共情力很强的情绪陪伴助手。

用户会输入一段日常便签文字，你需要完成下面两件事：
1. 精准识别用户当前情绪，只能从五种里面选：开心、兴奋、平静、不开心、焦虑
2. 根据识别出的情绪，生成一句简短、温暖、治愈、口语化的回复，大约50字，语气温柔亲切，不要鸡汤说教

重要：你绝对不能输出任何<think>标签或任何类似思考过程的标记。你只能输出一个纯粹的JSON对象，不能有其他任何内容。
只输出这一行：{"mood":"情绪标签","reply":"你的治愈回复"}`;

function streamLLMReply(userNote, onMood, onChunk, onDone) {
  const postData = JSON.stringify({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `用户便签内容：${userNote}` },
    ],
    stream: true,
  });

  const options = {
    hostname: BASE_URL,
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, res => {
    let buffer = '';
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      onDone();
    };

    res.on('data', chunk => {
      buffer += chunk.toString();

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') {
          finish();
          return;
        }

        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content || '';
          if (content) {
            onChunk(content);
          }
        } catch (e) {
          // Ignore parse errors for incomplete JSON
        }
      }
    });

    res.on('end', finish);
  });

  req.on('error', e => {
    console.error('LLM request error:', e);
    onDone();
  });

  req.write(postData);
  req.end();
}

function callLLM(userNote) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `用户便签内容：${userNote}` },
      ],
    });

    const options = {
      hostname: BASE_URL,
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk.toString();
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.message?.content || '';
          resolve(content);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

module.exports = { streamLLMReply, callLLM };
