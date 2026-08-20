const https = require('https');

// API 密钥从环境变量读取，确保不要硬编码在代码中
const API_KEY = process.env.MINIMAX_API_KEY;
if (!API_KEY) {
  console.error('[错误] 缺少 MINIMAX_API_KEY 环境变量！');
  console.error('请创建 backend/.env 文件，添加: MINIMAX_API_KEY=你的API密钥');
  process.exit(1);
}

const BASE_URL = 'api.minimaxi.com';
const MODEL = 'MiniMax-M2';

const SYSTEM_PROMPT = `你是一名温柔治愈、共情力很强的情绪陪伴助手。

用户会输入一段日常便签文字，你需要完成下面两件事：
1. 精准识别用户当前情绪，只能从五种里面选：开心、兴奋、平静、不开心、焦虑
2. 根据识别出的情绪，生成一句简短、温暖、治愈、口语化的回复，大约50字，语气温柔亲切，不要鸡汤说教

重要：你绝对不能输出任何<think>标签或任何类似思考过程的标记。你只能输出一个纯粹的JSON对象，不能有其他任何内容。
只输出这一行：{"mood":"情绪标签","reply":"你的治愈回复"}`;

/** 构造 chat/completions 请求体 */
function buildPayload(userNote, stream) {
  const body = {
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `用户便签内容：${userNote}` },
    ],
  };
  if (stream) {
    body.stream = true;
  }
  return JSON.stringify(body);
}

/**
 * 向 MiniMax chat/completions 发起请求
 *
 * @param {string} postData - 请求体
 * @param {(res: import('http').IncomingMessage) => void} onResponse - 响应处理
 * @param {(err: Error) => void} onError - 错误处理
 */
function postChatCompletion(postData, onResponse, onError) {
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

  const req = https.request(options, onResponse);
  req.on('error', onError);
  req.write(postData);
  req.end();
}

function streamLLMReply(userNote, onMood, onChunk, onDone) {
  const postData = buildPayload(userNote, true);

  const handleResponse = res => {
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
  };

  postChatCompletion(postData, handleResponse, e => {
    console.error('LLM request error:', e);
    onDone();
  });
}

function callLLM(userNote) {
  return new Promise((resolve, reject) => {
    const postData = buildPayload(userNote, false);

    postChatCompletion(
      postData,
      res => {
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
      },
      reject
    );
  });
}

module.exports = { streamLLMReply, callLLM };
