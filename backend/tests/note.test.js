const { callLLM } = require('../services/llm');

describe('Note Mood Detection API', () => {
  const testCases = [
    {
      name: '开心内容返回 mood=开心',
      input: '今天考试考了个好成绩，开心到飞起！',
      expectedMood: '开心',
    },
    {
      name: '难过内容返回 mood=不开心',
      input: '今天考试考砸了，心情很低落',
      expectedMood: '不开心',
    },
    {
      name: '焦虑内容返回 mood=焦虑',
      input: '离考试只有一周了，复习进度好慢，感觉来不及了',
      expectedMood: '焦虑',
    },
    {
      name: '兴奋内容返回 mood=兴奋',
      input: '明天要去春游啦，超级兴奋！睡不着！',
      expectedMood: '兴奋',
    },
    {
      name: '普通内容返回 mood=平静',
      input: '今天天气不错，出去散了个步',
      expectedMood: '平静',
    },
  ];

  testCases.forEach(({ name, input, expectedMood }) => {
    test(name, async () => {
      // 直接调用 llm.js 的 callLLM 函数
      const result = await callLLM(input);

      // 解析返回的 JSON
      let parsed;
      try {
        parsed = JSON.parse(result);
      } catch (e) {
        throw new Error(`LLM返回的不是有效JSON: ${result}`);
      }

      // 验证 mood 字段
      expect(parsed.mood).toBe(expectedMood);
    }, 30000); // 30秒超时，因为需要调用外部API
  });
});