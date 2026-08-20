const https = require('https');

const BASE_URL = 'api.minimaxi.com';
const MODEL = 'MiniMax-M2';
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ERROR_SNIPPET_LENGTH = 300;
const MISSING_API_KEY_MESSAGE = '缺少 MINIMAX_API_KEY 环境变量，请在 backend/.env 中配置';

const SYSTEM_PROMPT = `你是一名温柔治愈、共情力很强的情绪陪伴助手。

用户会输入一段日常便签文字，你需要完成下面两件事：
1. 精准识别用户当前情绪，只能从五种里面选：开心、兴奋、平静、不开心、焦虑
2. 根据识别出的情绪，生成一句简短、温暖、治愈、口语化的回复，大约50字，语气温柔亲切，不要鸡汤说教

重要：你绝对不能输出任何<think>标签或任何类似思考过程的标记。你只能输出一个纯粹的JSON对象，不能有其他任何内容。
只输出这一行：{"mood":"情绪标签","reply":"你的治愈回复"}`;

const getApiKey = () => {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error(MISSING_API_KEY_MESSAGE);
  }
  return apiKey;
};

const getSnippet = value => {
  const snippet = String(value || '').replace(/\s+/g, ' ').trim();
  return snippet.slice(0, MAX_ERROR_SNIPPET_LENGTH);
};

const describeUpstreamError = (prefix, body) => {
  const snippet = getSnippet(body);
  return snippet ? `${prefix}：${snippet}` : prefix;
};

const getApiError = json => {
  if (json?.base_resp && json.base_resp.status_code !== undefined) {
    if (Number(json.base_resp.status_code) !== 0) {
      return json.base_resp.status_msg || `MiniMax 返回错误（${json.base_resp.status_code}）`;
    }
  }

  if (json?.error) {
    return typeof json.error === 'string' ? json.error : JSON.stringify(json.error);
  }

  if (json?.base_resp && typeof json.base_resp === 'object') {
    const { status_msg: statusMessage } = json.base_resp;
    if (statusMessage) return statusMessage;
  }

  return null;
};

function streamLLMReply(userNote, onMood, onChunk, onDone, onError) {
  let request;
  let finished = false;
  let hasContent = false;
  let timeout;

  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    onDone();
  };

  const fail = error => {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    console.error('LLM stream error:', error);
    if (onError) {
      onError(error instanceof Error ? error : new Error(String(error)));
    } else {
      onDone();
    }
  };

  try {
    const apiKey = getApiKey();
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
        Authorization: `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    request = https.request(options, res => {
      let buffer = '';
      let responseBody = '';

      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.setEncoding('utf8');
        res.on('data', chunk => {
          responseBody += chunk;
        });
        res.on('error', error => fail(error));
        res.on('end', () => {
          fail(
            new Error(
              describeUpstreamError(
                `MiniMax 请求失败（HTTP ${res.statusCode || '未知状态码'}）`,
                responseBody
              )
            )
          );
        });
        return;
      }

      res.on('data', chunk => {
        responseBody += chunk.toString();
        const lines = responseBody.split('\n');
        responseBody = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            if (hasContent) {
              finish();
            } else {
              fail(new Error('MiniMax 未返回有效回复内容'));
            }
            return;
          }

          try {
            const json = JSON.parse(data);
            const apiError = getApiError(json);
            if (apiError) {
              fail(new Error(describeUpstreamError('MiniMax 返回错误', apiError)));
              return;
            }
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              hasContent = true;
              onChunk(content);
            }
          } catch (error) {
            console.error('无法解析完整的 MiniMax SSE 数据帧:', getSnippet(data));
            fail(new Error('MiniMax 返回的数据格式异常，请稍后重试'));
            return;
          }
        }
      });

      res.on('error', error => fail(error));
      res.on('end', () => {
        if (hasContent) {
          finish();
        } else {
          fail(new Error('MiniMax 未返回有效回复内容'));
        }
      });
    });

    request.on('error', error => fail(error));
    timeout = setTimeout(() => {
      request.destroy();
      fail(new Error('MiniMax 请求超时，请稍后重试'));
    }, REQUEST_TIMEOUT_MS);
    request.write(postData);
    request.end();
  } catch (error) {
    fail(error);
  }

  return {
    abort: () => {
      if (!finished && request) {
        finished = true;
        clearTimeout(timeout);
        request.destroy();
      }
    },
  };
}

function callLLM(userNote) {
  return new Promise((resolve, reject) => {
    let request;
    let settled = false;
    let timeout;

    const resolveOnce = content => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(content);
    };
    const rejectOnce = error => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    try {
      const apiKey = getApiKey();
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
          Authorization: `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      request = https.request(options, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk.toString();
        });
        res.on('error', error => rejectOnce(error));
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            rejectOnce(
              new Error(
                describeUpstreamError(
                  `MiniMax 请求失败（HTTP ${res.statusCode || '未知状态码'}）`,
                  data
                )
              )
            );
            return;
          }

          try {
            const json = JSON.parse(data);
            const apiError = getApiError(json);
            if (apiError) {
              rejectOnce(new Error(describeUpstreamError('MiniMax 返回错误', apiError)));
              return;
            }
            const content = json.choices?.[0]?.message?.content;
            if (typeof content !== 'string' || !content.trim()) {
              rejectOnce(new Error('MiniMax 未返回有效回复内容'));
              return;
            }
            resolveOnce(content);
          } catch (error) {
            rejectOnce(error);
          }
        });
      });

      request.on('error', error => rejectOnce(error));
      timeout = setTimeout(() => {
        request.destroy();
        rejectOnce(new Error('MiniMax 请求超时，请稍后重试'));
      }, REQUEST_TIMEOUT_MS);
      request.write(postData);
      request.end();
    } catch (error) {
      rejectOnce(error);
    }
  });
}

module.exports = { callLLM, getApiKey, streamLLMReply };
